import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrdersClient } from "./orders-client";
import { LiveRefresh } from "@/components/live-refresh";

export default async function OrdersPage() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;

  const [orders, restaurant] = await Promise.all([
    prisma.order.findMany({
      where: { restaurantId },
      include: {
        table: true,
        items: { include: { menuItem: true } },
        payments: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.restaurant.findUnique({ where: { id: restaurantId } }),
  ]);

  return (
    <>
      <LiveRefresh />
      <OrdersClient orders={orders} restaurant={restaurant} />
    </>
  );
}

