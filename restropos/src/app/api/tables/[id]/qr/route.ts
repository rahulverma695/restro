import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

const BASE_URL = process.env.NEXTAUTH_URL || "https://restropos.vercel.app";
const SESSION_TTL_MINUTES = 120;

function generatePin(): string {
  // Cryptographically random 4-digit PIN (0000–9999)
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 10000).padStart(4, "0");
}

// GET /api/tables/[id]/qr
// Generates a fresh ephemeral session + 4-digit steward PIN, returns QR.
// SECURITY: QR encodes a UUIDv4 session ID — NEVER the raw table CUID.
// Each call invalidates prior active sessions for this table.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: tableId } = await params;
  const restaurantId = (session.user as any).restaurantId as string;

  // Verify table belongs to this restaurant
  const table = await prisma.table.findFirst({
    where: { id: tableId, restaurantId },
  });
  if (!table) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  // Invalidate any existing active sessions for this table
  await prisma.tableSession.updateMany({
    where: { tableId, isActive: true },
    data: { isActive: false, closedAt: new Date() },
  });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MINUTES * 60 * 1000);
  const pin = generatePin();

  const tableSession = await prisma.tableSession.create({
    data: { tableId, restaurantId, pin, expiresAt },
  });

  // QR encodes /order/session/{uuid} — no table ID in URL
  const sessionUrl = `${BASE_URL}/order/session/${tableSession.id}`;
  const qr = await QRCode.toDataURL(sessionUrl, {
    width: 300,
    margin: 2,
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  return NextResponse.json({
    qr,
    url: sessionUrl,
    sessionId: tableSession.id,
    pin,                          // Staff sees this PIN in the POS dashboard
    tableNumber: table.number,
    expiresAt: tableSession.expiresAt.toISOString(),
  });
}
