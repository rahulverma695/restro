import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: any = { restaurantId, status: { not: "CANCELLED" } };
  if (from) where.createdAt = { ...where.createdAt, gte: new Date(from) };
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    where.createdAt = { ...where.createdAt, lte: toDate };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { payments: true },
    orderBy: { createdAt: "asc" },
  });

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });

  // Build CSV
  const rows = [
    ["GST Sales Report", restaurant?.name || "", "", "", "", "", ""],
    ["GSTIN", restaurant?.gstin || "Not provided", "", "", "", "", ""],
    ["Period", from || "All time", "to", to || "All time", "", "", ""],
    [""],
    ["Invoice No", "Date", "Order Type", "Payment Method", "Subtotal (₹)", "GST 5% (₹)", "Discount (₹)", "Total (₹)"],
    ...orders.map((o) => [
      o.orderNumber,
      format(new Date(o.createdAt), "dd/MM/yyyy"),
      o.type.replace("_", " "),
      o.payments[0]?.method || "—",
      o.subtotal.toFixed(2),
      o.taxAmount.toFixed(2),
      o.discount.toFixed(2),
      o.total.toFixed(2),
    ]),
    [""],
    ["TOTALS", "", "", "",
      orders.reduce((s, o) => s + o.subtotal, 0).toFixed(2),
      orders.reduce((s, o) => s + o.taxAmount, 0).toFixed(2),
      orders.reduce((s, o) => s + o.discount, 0).toFixed(2),
      orders.reduce((s, o) => s + o.total, 0).toFixed(2),
    ],
  ];

  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const filename = `GST_Report_${format(new Date(), "dd-MM-yyyy")}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
