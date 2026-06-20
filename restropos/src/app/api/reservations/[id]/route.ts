import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { status, tableId, notes } = body;

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status,
        tableId: tableId === null ? null : (tableId || undefined),
        notes: notes || undefined
      },
      include: { table: true }
    });

    if (status === "SEATED" && tableId) {
      // Mark table as occupied
      await prisma.table.update({
        where: { id: tableId },
        data: { status: "OCCUPIED" }
      });

      // If reservation has a linked pre-order, bind it to the table
      if (updated.orderId) {
        await prisma.order.update({
          where: { id: updated.orderId },
          data: {
            tableId: tableId,
            status: "CONFIRMED" // Activate the pre-order
          }
        });
      }
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Error updating reservation status:", err);
    return NextResponse.json({ error: err.message || "Failed to update reservation" }, { status: 500 });
  }
}
