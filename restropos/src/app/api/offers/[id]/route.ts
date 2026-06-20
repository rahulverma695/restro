import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const dataToUpdate: any = { ...body };
    if (body.value !== undefined) dataToUpdate.value = Number(body.value);
    if (body.minBillAmount !== undefined) dataToUpdate.minBillAmount = Number(body.minBillAmount);
    if (body.maxDiscount !== undefined) dataToUpdate.maxDiscount = body.maxDiscount ? Number(body.maxDiscount) : null;
    if (body.startDate) dataToUpdate.startDate = new Date(body.startDate);
    if (body.endDate) dataToUpdate.endDate = new Date(body.endDate);

    const updated = await prisma.offer.update({
      where: { id },
      data: dataToUpdate
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update offer" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.offer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete offer" }, { status: 500 });
  }
}
