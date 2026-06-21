import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.restaurantId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name, unit, quantity, minQuantity, costPerUnit } = await req.json();
  const item = await prisma.inventoryItem.create({
    data: { name, unit, quantity: Number(quantity), minQuantity: Number(minQuantity), costPerUnit: Number(costPerUnit), restaurantId: session.user.restaurantId },
  });
  return NextResponse.json(item);
}
