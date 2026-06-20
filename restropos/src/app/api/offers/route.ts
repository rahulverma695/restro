import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("restaurantId");
  if (!restaurantId) return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
  const offers = await prisma.offer.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(offers);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, code, discountType, value, minBillAmount, maxDiscount, startDate, endDate, isActive, restaurantId } = body;
    if (!title || !code || !value || !endDate || !restaurantId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        code,
        discountType,
        value: Number(value),
        minBillAmount: Number(minBillAmount || 0),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        startDate: new Date(startDate || new Date()),
        endDate: new Date(endDate),
        isActive: isActive ?? true,
        restaurantId
      }
    });
    return NextResponse.json(offer);
  } catch (err: any) {
    console.error("Error creating offer:", err);
    return NextResponse.json({ error: err.message || "Failed to create offer" }, { status: 500 });
  }
}
