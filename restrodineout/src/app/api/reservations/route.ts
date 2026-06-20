import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateOrderNumber() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `ORD-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.floor(Math.random() * 9000) + 1000}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("restaurantId");
  if (!restaurantId) {
    return NextResponse.json({ error: "restaurantId is required" }, { status: 400 });
  }

  try {
    const reservations = await prisma.reservation.findMany({
      where: { restaurantId },
      include: { table: true, order: { include: { items: { include: { menuItem: true } } } } },
      orderBy: { dateTime: "desc" },
    });
    return NextResponse.json(reservations);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch reservations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestName, guestPhone, guestCount, dateTime, notes, restaurantId, preOrderItems } = body;

    if (!guestName || !guestPhone || !guestCount || !dateTime || !restaurantId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let linkedOrderId: string | null = null;

    if (preOrderItems && preOrderItems.length > 0) {
      // Find staff user
      const staffUser = await prisma.user.findFirst({ where: { restaurantId } });
      if (!staffUser) {
        throw new Error("Restaurant setup incomplete (no owner/staff found to link order)");
      }

      // Find or create customer
      let customer = await prisma.customer.findFirst({
        where: { phone: guestPhone, restaurantId }
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: { name: guestName, phone: guestPhone, restaurantId }
        });
      }

      // Calculate totals
      const subtotal = preOrderItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
      const taxAmount = Math.round(subtotal * 0.05);
      const total = subtotal + taxAmount;

      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          type: "DINE_IN",
          status: "PENDING",
          source: "PRE_ORDER",
          restaurantId,
          userId: staffUser.id,
          customerId: customer.id,
          subtotal,
          taxAmount,
          total,
          notes: notes ? `Advance Pre-Order: ${notes}` : "Advance Pre-Order"
        }
      });

      // Create order items
      for (const item of preOrderItems) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: item.menuItemId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            price: item.price
          }
        });
      }

      linkedOrderId = order.id;
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        guestName,
        guestPhone,
        guestCount: Number(guestCount),
        dateTime: new Date(dateTime),
        notes: notes || null,
        restaurantId,
        status: "PENDING",
        orderId: linkedOrderId
      }
    });

    return NextResponse.json(reservation);
  } catch (err: any) {
    console.error("Error creating reservation with pre-order:", err);
    return NextResponse.json({ error: err.message || "Failed to submit reservation request" }, { status: 500 });
  }
}
