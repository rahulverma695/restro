import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM
  const staffId = searchParams.get("staffId");

  const where: any = { staff: { restaurantId } };
  if (staffId) where.staffId = staffId;
  if (month) {
    const [y, m] = month.split("-").map(Number);
    where.date = {
      gte: new Date(y, m - 1, 1),
      lt: new Date(y, m, 1),
    };
  }

  const records = await prisma.attendanceRecord.findMany({
    where,
    include: { staff: { include: { user: { select: { name: true } } } } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const { records } = await req.json();
  // records: [{ staffId, date, status, minutesLate, note }]
  const results = [];
  for (const r of records) {
    const date = new Date(r.date);
    date.setHours(0, 0, 0, 0);
    const record = await prisma.attendanceRecord.upsert({
      where: { staffId_date: { staffId: r.staffId, date } },
      update: { status: r.status, minutesLate: r.minutesLate || 0, note: r.note || null },
      create: { staffId: r.staffId, date, status: r.status, minutesLate: r.minutesLate || 0, note: r.note || null },
    });
    results.push(record);
  }
  return NextResponse.json(results);
}
