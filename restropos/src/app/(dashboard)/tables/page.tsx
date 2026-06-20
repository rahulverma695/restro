import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TablesClient } from "./tables-client";

export default async function TablesPage() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;

  const tables = await prisma.table.findMany({
    where: { restaurantId },
    include: {
      orders: {
        where: { status: { in: ["CONFIRMED", "PREPARING", "READY", "SERVED"] } },
        include: { items: { include: { menuItem: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { number: "asc" },
  });

  return <TablesClient tables={tables} restaurantId={restaurantId} />;
}
