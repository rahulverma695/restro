import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MarketingClient } from "./marketing-client";

export default async function MarketingPage() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;

  const [restaurant, customers, menuItems] = await Promise.all([
    prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, name: true, address: true, logo: true, brandColor: true, tagline: true },
    }),
    prisma.customer.findMany({
      where: { restaurantId, phone: { not: "" } },
      select: { id: true, name: true, phone: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.menuItem.findMany({
      where: { restaurantId, isAvailable: true },
      select: { id: true, name: true, price: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <MarketingClient restaurant={restaurant} customers={customers} menuItems={menuItems} />;
}
