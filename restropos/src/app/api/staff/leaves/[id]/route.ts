import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();
  const leave = await prisma.leaveRequest.update({ where: { id }, data: { status } });

  // If approved, auto-create attendance records as ON_LEAVE
  if (status === "APPROVED") {
    const from = new Date(leave.fromDate);
    const to = new Date(leave.toDate);
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      await prisma.attendanceRecord.upsert({
        where: { staffId_date: { staffId: leave.staffId, date } },
        update: { status: "ON_LEAVE" },
        create: { staffId: leave.staffId, date, status: "ON_LEAVE" },
      });
    }
  }
  return NextResponse.json(leave);
}
