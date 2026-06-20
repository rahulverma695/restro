import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;

  const items = await prisma.inventoryItem.findMany({
    where: { restaurantId },
    orderBy: { name: "asc" },
  });

  return <InventoryClient items={items} restaurantId={restaurantId} />;
}
