import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { name: true, address: true, phone: true, logo: true, brandColor: true, tagline: true },
  });
  return NextResponse.json(restaurant);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const restaurant = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      brandColor: data.brandColor,
      tagline: data.tagline,
      logo: data.logo,
    },
  });
  return NextResponse.json(restaurant);
}
