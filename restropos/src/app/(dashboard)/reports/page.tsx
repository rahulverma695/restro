import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Fetch all orders with items and payments
  const orders = await prisma.order.findMany({
    where: { restaurantId, createdAt: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" } },
    include: {
      items: { include: { menuItem: true } },
      payments: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Build top items from order items in JS
  const itemCountMap: Record<string, { name: string; quantity: number }> = {};
  for (const order of orders) {
    for (const item of order.items) {
      if (!itemCountMap[item.menuItemId]) {
        itemCountMap[item.menuItemId] = { name: item.menuItem.name, quantity: 0 };
      }
      itemCountMap[item.menuItemId].quantity += item.quantity;
    }
  }
  const topItems = Object.values(itemCountMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Build payment breakdown in JS
  const paymentMap: Record<string, number> = {};
  for (const order of orders) {
    for (const p of order.payments) {
      paymentMap[p.method] = (paymentMap[p.method] || 0) + p.amount;
    }
  }
  const paymentBreakdown = Object.entries(paymentMap).map(([method, amount]) => ({ method, amount }));

  return (
    <ReportsClient
      orders={orders}
      topItems={topItems}
      paymentBreakdown={paymentBreakdown}
    />
  );
}
