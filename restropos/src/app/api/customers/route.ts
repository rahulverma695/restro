import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, phone, email, restaurantId } = await req.json();
  const customer = await prisma.customer.create({
    data: { name, phone, email: email || null, restaurantId },
  });
  return NextResponse.json(customer);
}
