import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SimulationClient } from "./simulation-client";

export default async function SimulationPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const restaurantId = (session.user as any).restaurantId;
  const userId = (session.user as any).id;

  // Fetch current tables
  const tables = await prisma.table.findMany({
    where: { restaurantId },
    orderBy: { number: "asc" },
  });

  // Fetch current menu items
  const menuItems = await prisma.menuItem.findMany({
    where: { restaurantId },
    orderBy: { name: "asc" },
  });

  return (
    <SimulationClient
      initialTables={tables}
      menuItems={menuItems}
      restaurantId={restaurantId}
      userId={userId}
    />
  );
}
