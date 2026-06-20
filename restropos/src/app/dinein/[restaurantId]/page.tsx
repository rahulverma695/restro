import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DineinClient } from "./dinein-client";

export default async function DineinPublicPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant) return notFound();

  const [offers, categories] = await Promise.all([
    prisma.offer.findMany({
      where: {
        restaurantId,
        isActive: true,
        endDate: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { restaurantId, isActive: true },
      include: {
        menuItems: {
          where: { isAvailable: true },
          include: { variants: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // Serialize dates for safe client transit
  const serializedOffers = offers.map(o => ({
    ...o,
    startDate: o.startDate.toISOString(),
    endDate: o.endDate.toISOString(),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }));

  return (
    <DineinClient
      restaurant={restaurant}
      offers={serializedOffers}
      categories={categories}
    />
  );
}
