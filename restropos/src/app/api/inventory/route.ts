import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, unit, quantity, minQuantity, costPerUnit, restaurantId } = await req.json();
  const item = await prisma.inventoryItem.create({
    data: { name, unit, quantity: Number(quantity), minQuantity: Number(minQuantity), costPerUnit: Number(costPerUnit), restaurantId },
  });
  return NextResponse.json(item);
}
