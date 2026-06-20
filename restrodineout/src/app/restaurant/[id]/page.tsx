import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RestaurantClient } from "./restaurant-client";

export const revalidate = 0; // Disable cache for real-time menu prices

export default async function RestaurantProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
  });

  if (!restaurant) return notFound();

  const [offers, categories] = await Promise.all([
    prisma.offer.findMany({
      where: {
        restaurantId: id,
        isActive: true,
        endDate: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: {
        restaurantId: id,
        isActive: true,
      },
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
  const serializedRestaurant = {
    id: restaurant.id,
    name: restaurant.name,
    tagline: restaurant.tagline,
    address: restaurant.address,
    phone: restaurant.phone,
    logo: restaurant.logo,
    currency: restaurant.currency,
    brandColor: restaurant.brandColor,
  };

  const serializedOffers = offers.map(o => ({
    id: o.id,
    title: o.title,
    description: o.description,
    code: o.code,
    discountType: o.discountType,
    value: o.value,
    minBillAmount: o.minBillAmount,
    maxDiscount: o.maxDiscount,
    endDate: o.endDate.toISOString(),
  }));

  const serializedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    menuItems: cat.menuItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      variants: item.variants.map(v => ({
        id: v.id,
        name: v.name,
        price: v.price,
      })),
    })),
  }));

  return (
    <RestaurantClient
      restaurant={serializedRestaurant}
      offers={serializedOffers}
      categories={serializedCategories}
    />
  );
}
