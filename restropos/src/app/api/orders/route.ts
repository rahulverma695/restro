import { NextRequest, NextResponse } from "next/server";
import { prisma, basePrisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { logError } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.restaurantId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { restaurantId, id: userId } = session.user;

  try {
    const { orderType, tableId, items, discount, paymentMethod, notes } =
      await req.json();

    const orderId = await basePrisma.$transaction(async (tx) => {
      // Fetch restaurant to get taxRate
      const restaurant = await tx.restaurant.findUnique({ where: { id: restaurantId } });
      const taxRate = (restaurant?.taxRate ?? 5.0) / 100;

      // Fetch actual menu item prices from DB — never trust client-submitted prices
      const itemIds: string[] = items.map((i: any) => i.menuItemId);
      const menuItems = await tx.menuItem.findMany({ where: { id: { in: itemIds } } });
      const priceMap = new Map(menuItems.map((m) => [m.id, m.price]));

      // Also resolve variant prices where applicable
      const variantIds: string[] = items.filter((i: any) => i.variantId).map((i: any) => i.variantId);
      const variants = variantIds.length
        ? await tx.variant.findMany({ where: { id: { in: variantIds } } })
        : [];
      const variantPriceMap = new Map(variants.map((v) => [v.id, v.price]));

      // Server-side total recalculation
      const subtotal = items.reduce((sum: number, i: any) => {
        const unitPrice = i.variantId ? (variantPriceMap.get(i.variantId) ?? priceMap.get(i.menuItemId) ?? 0) : (priceMap.get(i.menuItemId) ?? 0);
        return sum + unitPrice * i.quantity;
      }, 0);
      const appliedDiscount = discount || 0;
      const taxAmount = Math.round((subtotal - appliedDiscount) * taxRate * 100) / 100;
      const total = subtotal - appliedDiscount + taxAmount;

      // Inventory stock validation before any writes
      for (const item of items) {
        const inventoryLinks = await tx.menuInventoryLink.findMany({ where: { menuItemId: item.menuItemId } });
        for (const link of inventoryLinks) {
          const required = link.quantityUsed * item.quantity;
          const stock = await tx.inventoryItem.findUnique({ where: { id: link.inventoryItemId } });
          if (stock && stock.quantity < required) {
            throw new Error(`Insufficient stock: ${stock.name}`);
          }
        }
      }

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          type: orderType,
          status: "CONFIRMED",
          restaurantId,
          userId,
          tableId: tableId || null,
          subtotal,
          taxAmount,
          discount: appliedDiscount,
          total,
          notes: notes || null,
        },
      });

      // Create order items using server-resolved prices
      for (const i of items) {
        const unitPrice = i.variantId ? (variantPriceMap.get(i.variantId) ?? priceMap.get(i.menuItemId) ?? 0) : (priceMap.get(i.menuItemId) ?? 0);
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: i.menuItemId,
            variantId: i.variantId || null,
            quantity: i.quantity,
            price: unitPrice,
            notes: i.notes || null,
          },
        });
      }

      // Create payment
      await tx.payment.create({
        data: { orderId: order.id, method: paymentMethod, amount: total },
      });

      // Update table status
      if (tableId) {
        await tx.table.update({ where: { id: tableId }, data: { status: "OCCUPIED" } });
      }

      // Deduct inventory
      for (const item of items) {
        const links = await tx.menuInventoryLink.findMany({ where: { menuItemId: item.menuItemId } });
        for (const link of links) {
          await tx.inventoryItem.update({
            where: { id: link.inventoryItemId },
            data: { quantity: { decrement: link.quantityUsed * item.quantity } },
          });
        }
      }

      return order.id;
    });

    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    await logError("/api/orders", "POST", 500, err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.restaurantId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { restaurantId } = session.user;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");

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
