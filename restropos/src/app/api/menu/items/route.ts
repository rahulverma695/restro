import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, price, description, isVeg, categoryId, restaurantId, variants } = await req.json();

  const item = await prisma.menuItem.create({
    data: { name, price: Number(price), description: description || null, isVeg, categoryId, restaurantId },
  });

  // Create variants separately (no nested writes in HTTP mode)
  if (variants?.length) {
    for (const v of variants) {
      await prisma.variant.create({ data: { name: v.name, price: Number(v.price), menuItemId: item.id } });
    }
  }

  return NextResponse.json(item);
}
