import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;
  const leaves = await prisma.leaveRequest.findMany({
    where: { staff: { restaurantId } },
    include: { staff: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(leaves);
}

export async function POST(req: NextRequest) {
  const { staffId, fromDate, toDate, type, reason } = await req.json();
  const leave = await prisma.leaveRequest.create({
    data: { staffId, fromDate: new Date(fromDate), toDate: new Date(toDate), type, reason },
  });
  return NextResponse.json(leave);
}
