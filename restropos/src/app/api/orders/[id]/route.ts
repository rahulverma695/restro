import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();
  const order = await prisma.order.update({ where: { id }, data: { status } });

  if ((status === "COMPLETED" || status === "CANCELLED") && order.tableId) {
    await prisma.table.update({ where: { id: order.tableId }, data: { status: "AVAILABLE" } });
  }

  return NextResponse.json(order);
}
