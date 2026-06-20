import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { number, capacity, section, restaurantId } = await req.json();
  const table = await prisma.table.create({
    data: { number, capacity: Number(capacity), section, restaurantId },
  });
  return NextResponse.json(table);
}
