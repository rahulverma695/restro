import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MenuClient } from "./menu-client";

async function getMenuCategories(restaurantId: string) {
  return prisma.category.findMany({
    where: { restaurantId },
    include: {
      menuItems: { include: { variants: true }, orderBy: { name: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export default async function MenuPage() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;
  const categories = await getMenuCategories(restaurantId);
  return <MenuClient categories={categories} restaurantId={restaurantId} />;
}
