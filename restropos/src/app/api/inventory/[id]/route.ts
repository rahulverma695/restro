import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const item = await prisma.inventoryItem.update({
    where: { id },
    data: {
      name: data.name,
      unit: data.unit,
      quantity: Number(data.quantity),
      minQuantity: Number(data.minQuantity),
      costPerUnit: Number(data.costPerUnit),
    },
  });
  return NextResponse.json(item);
}
