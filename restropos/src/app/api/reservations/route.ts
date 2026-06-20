import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("restaurantId");
  if (!restaurantId) return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
  const reservations = await prisma.reservation.findMany({
    where: { restaurantId },
    include: { table: true },
    orderBy: { dateTime: "desc" }
  });
  return NextResponse.json(reservations);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestName, guestPhone, guestCount, dateTime, notes, restaurantId } = body;
    if (!guestName || !guestPhone || !guestCount || !dateTime || !restaurantId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const reservation = await prisma.reservation.create({
      data: {
        guestName,
        guestPhone,
        guestCount: Number(guestCount),
        dateTime: new Date(dateTime),
        notes: notes || null,
        restaurantId,
        status: "PENDING"
      }
    });
    return NextResponse.json(reservation);
  } catch (err: any) {
    console.error("Error creating reservation:", err);
    return NextResponse.json({ error: err.message || "Failed to create reservation" }, { status: 500 });
  }
}
