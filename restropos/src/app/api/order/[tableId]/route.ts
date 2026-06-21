import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

// GET — fetch table + menu + active order for the QR ordering page
export async function GET(_: NextRequest, { params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = await params;

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { restaurant: true },
  });

  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const categories = await prisma.category.findMany({
    where: { restaurantId: table.restaurantId, isActive: true },
    include: {
      menuItems: {
        where: { isAvailable: true },
        include: { variants: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const offers = await prisma.offer.findMany({
    where: {
      restaurantId: table.restaurantId,
      isActive: true,
      endDate: { gte: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  // Query if there is an active order on this table (status not completed or cancelled)
  const activeOrder = await prisma.order.findFirst({
    where: {
      tableId,
      status: { notIn: ["COMPLETED", "CANCELLED"] }
    },
    include: {
      items: {
        include: { menuItem: true }
      }
    }
  });

  return NextResponse.json({
    table: { id: table.id, number: table.number, section: table.section },
    restaurant: { name: table.restaurant.name, address: table.restaurant.address, logo: table.restaurant.logo },
    categories,
    offers,
    activeOrder: activeOrder ? {
      id: activeOrder.id,
      orderNumber: activeOrder.orderNumber,
      subtotal: activeOrder.subtotal,
      taxAmount: activeOrder.taxAmount,
      discount: activeOrder.discount,
      total: activeOrder.total,
      customerName: activeOrder.customerId ? (await prisma.customer.findUnique({ where: { id: activeOrder.customerId } }))?.name : null,
      items: activeOrder.items.map(item => ({
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.price,
        variantId: item.variantId
      }))
    } : null
  });
}

// POST — place or append order from QR scan
export async function POST(req: NextRequest, { params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = await params;

  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const { customerName, customerPhone, items, couponCode } = await req.json();

  if (!customerName || !items?.length) {
    return NextResponse.json({ error: "Name and items required" }, { status: 400 });
  }

  // Find or create customer
  let customer = await prisma.customer.findFirst({
    where: { phone: customerPhone, restaurantId: table.restaurantId },
  });
  if (!customer && customerPhone) {
    customer = await prisma.customer.create({
      data: { name: customerName, phone: customerPhone, restaurantId: table.restaurantId },
    });
  }

  // Find active order on this table
  const activeOrder = await prisma.order.findFirst({
    where: {
      tableId,
      status: { notIn: ["COMPLETED", "CANCELLED"] }
    }
  });

  if (activeOrder) {
    // ── APPEND TO EXISTING ORDER ──
    // Insert new order items linked to existing order
    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: activeOrder.id,
          menuItemId: item.menuItemId,
          variantId: item.variantId || null,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || null,
        },
      });
    }

    // Recalculate totals
    const allItems = await prisma.orderItem.findMany({
      where: { orderId: activeOrder.id }
    });
    const subtotal = allItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let discount = activeOrder.discount;
    if (couponCode) {
      const offer = await prisma.offer.findFirst({
        where: {
          code: couponCode,
          restaurantId: table.restaurantId,
          isActive: true,
          endDate: { gte: new Date() },
          minBillAmount: { lte: subtotal }
        }
      });
      if (offer) {
        if (offer.discountType === "PERCENTAGE") {
          discount = Math.round((subtotal * offer.value) / 100);
          if (offer.maxDiscount) {
            discount = Math.min(discount, offer.maxDiscount);
          }
        } else {
          discount = offer.value;
        }
        discount = Math.min(discount, subtotal);
      }
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: table.restaurantId } });
    const gstRate = (restaurant?.taxRate ?? 5) / 100;
    const taxAmount = Math.round((subtotal - discount) * gstRate);
    const total = subtotal - discount + taxAmount;

    // Update existing order
    const updatedOrder = await prisma.order.update({
      where: { id: activeOrder.id },
      data: {
        subtotal,
        taxAmount,
        discount,
        total,
      }
    });

    // Update or create payment record
    const payment = await prisma.payment.findFirst({
      where: { orderId: activeOrder.id }
    });
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { amount: total }
      });
    } else {
      await prisma.payment.create({
        data: { orderId: activeOrder.id, method: "CASH", amount: total },
      });
    }

    return NextResponse.json({ success: true, orderNumber: updatedOrder.orderNumber, total });

  } else {
    // ── CREATE NEW ORDER ──
    const staffUser = await prisma.user.findFirst({ where: { restaurantId: table.restaurantId } });
    if (!staffUser) return NextResponse.json({ error: "Restaurant setup incomplete" }, { status: 500 });

    const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);

    let discount = 0;
    if (couponCode) {
      const offer = await prisma.offer.findFirst({
        where: {
          code: couponCode,
          restaurantId: table.restaurantId,
          isActive: true,
          endDate: { gte: new Date() },
          minBillAmount: { lte: subtotal }
        }
      });
      if (offer) {
        if (offer.discountType === "PERCENTAGE") {
          discount = Math.round((subtotal * offer.value) / 100);
          if (offer.maxDiscount) {
            discount = Math.min(discount, offer.maxDiscount);
          }
        } else {
          discount = offer.value;
        }
        discount = Math.min(discount, subtotal);
      }
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: table.restaurantId } });
    const gstRate = (restaurant?.taxRate ?? 5) / 100;
    const taxAmount = Math.round((subtotal - discount) * gstRate);
    const total = subtotal - discount + taxAmount;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        type: "DINE_IN",
        status: "PENDING",
        source: "TABLE_QR",
        restaurantId: table.restaurantId,
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
          notes: item.notes || null,
        },
      });
    }

    await prisma.payment.create({
      data: { orderId: order.id, method: "CASH", amount: total },
    });

    // Mark table occupied
    await prisma.table.update({ where: { id: tableId }, data: { status: "OCCUPIED" } });

    return NextResponse.json({ success: true, orderNumber: order.orderNumber, total });
  }
}
