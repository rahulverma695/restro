import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateOfferSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  code: z.string().min(1).max(20).toUpperCase(),
  discountType: z.enum(["PERCENTAGE", "FLAT"]),
  value: z.number().positive(),
  minBillAmount: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

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
    const parsed = CreateOfferSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { title, description, code, discountType, value, minBillAmount, maxDiscount, startDate, endDate } = parsed.data;
    const { isActive, restaurantId } = body;
    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        code,
        discountType,
        value,
        minBillAmount,
        maxDiscount: maxDiscount ?? null,
        startDate: new Date(startDate),
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
