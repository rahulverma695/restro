import { prisma } from "@/lib/prisma";
import { DineoutClient } from "./dineout-client";

export const revalidate = 0; // Disable server cache to ensure real-time POS price/offer updates

export default async function Home() {
  const [restaurants, offers] = await Promise.all([
    prisma.restaurant.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.offer.findMany({
      where: {
        isActive: true,
        endDate: { gte: new Date() },
      },
      include: {
        restaurant: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Serialize for safe client transport
  const serializedRestaurants = restaurants.map(r => ({
    id: r.id,
    name: r.name,
    tagline: r.tagline,
    address: r.address,
    phone: r.phone,
    logo: r.logo,
    brandColor: r.brandColor,
  }));

  const serializedOffers = offers.map(o => ({
    id: o.id,
    title: o.title,
    description: o.description,
    code: o.code,
    discountType: o.discountType,
    value: o.value,
    minBillAmount: o.minBillAmount,
    maxDiscount: o.maxDiscount,
    restaurantId: o.restaurantId,
    restaurantName: o.restaurant.name,
    endDate: o.endDate.toISOString(),
  }));

  return (
    <DineoutClient
      restaurants={serializedRestaurants}
      offers={serializedOffers}
    />
  );
}
