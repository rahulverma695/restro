import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { restaurantId, userId, orderType, tableId, items, discount, paymentMethod, subtotal, taxAmount, total, notes } =
      await req.json();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        type: orderType,
        status: "CONFIRMED",
        restaurantId,
        userId,
        tableId: tableId || null,
        subtotal,
        taxAmount,
        discount: discount || 0,
        total,
        notes: notes || null,
      },
    });

    // Create order items
    for (const i of items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          menuItemId: i.menuItemId,
          variantId: i.variantId || null,
          quantity: i.quantity,
          price: i.price,
          notes: i.notes || null,
        },
      });
    }

    // Create payment
    await prisma.payment.create({
      data: { orderId: order.id, method: paymentMethod, amount: total },
    });

    // Update table status
    if (tableId) {
      await prisma.table.update({ where: { id: tableId }, data: { status: "OCCUPIED" } });
    }

    // Deduct inventory (best-effort)
    for (const item of items) {
      const links = await prisma.menuInventoryLink.findMany({ where: { menuItemId: item.menuItemId } });
      for (const link of links) {
        await prisma.inventoryItem.update({
          where: { id: link.inventoryItemId },
          data: { quantity: { decrement: link.quantityUsed * item.quantity } },
        });
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("restaurantId");
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

  const where: any = { restaurantId };
  if (status) where.status = status;
  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    where.createdAt = { gte: d, lte: end };
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      table: true,
      items: { include: { menuItem: true } },
      payments: true,
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(orders);
}
