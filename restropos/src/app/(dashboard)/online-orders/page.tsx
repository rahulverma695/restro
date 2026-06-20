import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnlineOrdersClient } from "./online-orders-client";

export default async function OnlineOrdersPage() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;

  const orders = await prisma.order.findMany({
    where: { restaurantId, source: { not: "DIRECT" } },
    include: {
      items: { include: { menuItem: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <OnlineOrdersClient orders={orders} restaurantId={restaurantId} />;
}
