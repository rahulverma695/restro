import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MenuClient } from "./menu-client";

export default async function MenuPage() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;

  const categories = await prisma.category.findMany({
    where: { restaurantId },
    include: {
      menuItems: { include: { variants: true }, orderBy: { name: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return <MenuClient categories={categories} restaurantId={restaurantId} />;
}
