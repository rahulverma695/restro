import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

const COOKIE_NAME = "rpos_session";
const COOKIE_TTL_SECONDS = 120 * 60; // 120 minutes

// ─── Session resolution helper ───────────────────────────────────────────────
// Validates the session cookie and resolves the actual tableId from the DB.
// The client NEVER sends or knows the tableId directly.
async function resolveSession(req: NextRequest, sessionId: string) {
  const cookieSessionId = req.cookies.get(COOKIE_NAME)?.value;

  // The cookie must match the URL sessionId — prevents cookie injection across sessions
  if (!cookieSessionId || cookieSessionId !== sessionId) {
    return { error: "Session not verified", status: 401 };
  }

  const session = await prisma.tableSession.findFirst({
    where: {
      id: sessionId,
      isActive: true,
      isActivated: true,
      expiresAt: { gt: new Date() },
    },
    include: { table: true },
  });

  if (!session) {
    return { error: "Session expired or invalid", status: 403 };
  }

  return { session, tableId: session.tableId, restaurantId: session.restaurantId };
}

// ─── GET — fetch table + menu + active order ──────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  // Validate session exists and is active (not yet necessarily activated — for PIN screen)
  const tableSession = await prisma.tableSession.findFirst({
    where: {
      id: sessionId,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
    include: { table: { include: { restaurant: true } } },
  });

  if (!tableSession) {
    return NextResponse.json({ error: "Session expired or not found" }, { status: 404 });
  }

  const { tableId, restaurantId } = tableSession;

  // Only fetch menu & orders if session has been activated via PIN
  if (!tableSession.isActivated) {
    return NextResponse.json({
      requiresPin: true,
      tableNumber: tableSession.table.number,
      restaurantName: tableSession.table.restaurant.name,
    });
  }

  // Verify cookie matches for activated sessions
  const cookieVal = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieVal !== sessionId) {
    return NextResponse.json({ error: "Session not verified. Re-enter PIN." }, { status: 401 });
  }

  const [categories, offers, activeOrder] = await Promise.all([
    prisma.category.findMany({
      where: { restaurantId, isActive: true },
      include: {
        menuItems: {
          where: { isAvailable: true },
          include: { variants: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.offer.findMany({
      where: { restaurantId, isActive: true, endDate: { gte: new Date() } },
      orderBy: { createdAt: "desc" },
      // Only return non-sensitive fields — do NOT expose offer list with codes
      select: { id: true, title: true, description: true, code: true, discountType: true, value: true, minBillAmount: true, maxDiscount: true, endDate: true },
    }),
    prisma.order.findFirst({
      where: { tableId, status: { notIn: ["COMPLETED", "CANCELLED"] } },
      include: { items: { include: { menuItem: { select: { name: true } } } } },
    }),
  ]);

  return NextResponse.json({
    requiresPin: false,
    table: {
      number: tableSession.table.number,
      section: tableSession.table.section,
    },
    restaurant: {
      name: tableSession.table.restaurant.name,
      address: tableSession.table.restaurant.address,
      logo: tableSession.table.restaurant.logo,
    },
    categories,
    offers,
    activeOrder: activeOrder
      ? {
          id: activeOrder.id,
          orderNumber: activeOrder.orderNumber,
          subtotal: activeOrder.subtotal,
          taxAmount: activeOrder.taxAmount,
          discount: activeOrder.discount,
          total: activeOrder.total,
          items: activeOrder.items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.menuItem.name,
            quantity: item.quantity,
            price: item.price,
            variantId: item.variantId,
          })),
        }
      : null,
  });
}

// ─── POST — activate PIN or place/append order ────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await req.json();

  // ── Step 1: PIN Activation ──
  if (body.action === "activate") {
    const { pin } = body;
    if (!pin) {
      return NextResponse.json({ error: "PIN required" }, { status: 400 });
    }

    const tableSession = await prisma.tableSession.findFirst({
      where: {
        id: sessionId,
        isActive: true,
        isActivated: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tableSession) {
      return NextResponse.json({ error: "Session expired or already activated" }, { status: 403 });
    }

    if (tableSession.pin !== pin) {
      return NextResponse.json({ error: "Incorrect PIN. Ask your steward." }, { status: 401 });
    }

    // Mark session as activated
    await prisma.tableSession.update({
      where: { id: sessionId },
      data: { isActivated: true },
    });

    // Set HttpOnly, Secure session cookie — binds this browser to the session
    const response = NextResponse.json({ success: true, activated: true });
    response.cookies.set(COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: COOKIE_TTL_SECONDS,
      path: "/",
    });
    return response;
  }

  // ── Step 2: Place / Append Order ──
  if (body.action === "order") {
    const resolved = await resolveSession(req, sessionId);
    if ("error" in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status });
    }

    const { tableId, restaurantId } = resolved;
    const { customerName, customerPhone, items, couponCode } = body;

    if (!customerName || !items?.length) {
      return NextResponse.json({ error: "Name and items required" }, { status: 400 });
    }

    // Find or create customer (phone optional)
    let customer = customerPhone
      ? await prisma.customer.findFirst({ where: { phone: customerPhone, restaurantId } })
      : null;

    if (!customer && customerPhone) {
      customer = await prisma.customer.create({
        data: { name: customerName, phone: customerPhone, restaurantId },
      });
    }

    const activeOrder = await prisma.order.findFirst({
      where: { tableId, status: { notIn: ["COMPLETED", "CANCELLED"] } },
    });

    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

    if (activeOrder) {
      // ── Append to existing order ──
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            orderId: activeOrder.id,
            menuItemId: item.menuItemId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }

      const allItems = await prisma.orderItem.findMany({ where: { orderId: activeOrder.id } });
      const subtotal = allItems.reduce((s, i) => s + i.price * i.quantity, 0);

      let discount = activeOrder.discount;
      if (couponCode) {
        const offer = await prisma.offer.findFirst({
          where: { code: couponCode, restaurantId, isActive: true, endDate: { gte: new Date() }, minBillAmount: { lte: subtotal } },
        });
        if (offer) {
          discount = offer.discountType === "PERCENTAGE"
            ? Math.min(Math.round((subtotal * offer.value) / 100), offer.maxDiscount ?? Infinity)
            : offer.value;
          discount = Math.min(discount, subtotal);
        }
      }

      const taxAmount = Math.round((subtotal - discount) * 0.05);
      const total = subtotal - discount + taxAmount;

      const updated = await prisma.order.update({
        where: { id: activeOrder.id },
        data: { subtotal, taxAmount, discount, total },
      });

      const payment = await prisma.payment.findFirst({ where: { orderId: activeOrder.id } });
      if (payment) {
        await prisma.payment.update({ where: { id: payment.id }, data: { amount: total } });
      } else {
        await prisma.payment.create({ data: { orderId: activeOrder.id, method: "CASH", amount: total } });
      }

      return NextResponse.json({ success: true, orderNumber: updated.orderNumber, total });

    } else {
      // ── Create new order ──
      const staffUser = await prisma.user.findFirst({ where: { restaurantId } });
      if (!staffUser) return NextResponse.json({ error: "Restaurant setup incomplete" }, { status: 500 });

      const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);

      let discount = 0;
      if (couponCode) {
        const offer = await prisma.offer.findFirst({
          where: { code: couponCode, restaurantId, isActive: true, endDate: { gte: new Date() }, minBillAmount: { lte: subtotal } },
        });
        if (offer) {
          discount = offer.discountType === "PERCENTAGE"
            ? Math.min(Math.round((subtotal * offer.value) / 100), offer.maxDiscount ?? Infinity)
            : offer.value;
          discount = Math.min(discount, subtotal);
        }
      }

      const taxAmount = Math.round((subtotal - discount) * 0.05);
      const total = subtotal - discount + taxAmount;

      const order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          type: "DINE_IN",
          status: "PENDING",
          source: "TABLE_QR",
          restaurantId,
          userId: staffUser.id,
          tableId,
          customerId: customer?.id || null,
          subtotal,
          taxAmount,
          discount,
          total,
        },
      });

      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: item.menuItemId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }

      await prisma.payment.create({ data: { orderId: order.id, method: "CASH", amount: total } });
      await prisma.table.update({ where: { id: tableId }, data: { status: "OCCUPIED" } });

      return NextResponse.json({ success: true, orderNumber: order.orderNumber, total });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
