import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SESSION_TTL_MINUTES = 120;

function generatePin(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 10000).padStart(4, "0");
}

// POST /api/sessions — Staff creates a new session for a table (closes prior active ones)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tableId } = await req.json();
  if (!tableId) {
    return NextResponse.json({ error: "tableId is required" }, { status: 400 });
  }

  const restaurantId = (session.user as any).restaurantId as string;

  const table = await prisma.table.findFirst({ where: { id: tableId, restaurantId } });
  if (!table) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  await prisma.tableSession.updateMany({
    where: { tableId, isActive: true },
    data: { isActive: false, closedAt: new Date() },
  });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MINUTES * 60 * 1000);
  const pin = generatePin();

  const newSession = await prisma.tableSession.create({
    data: { tableId, restaurantId, pin, expiresAt },
  });

  return NextResponse.json({
    sessionId: newSession.id,
    pin,
    tableNumber: table.number,
    expiresAt: newSession.expiresAt.toISOString(),
  });
}

// DELETE /api/sessions?sessionId=xxx — Staff manually closes a session (on checkout)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const restaurantId = (session.user as any).restaurantId as string;

  const tableSession = await prisma.tableSession.findFirst({ where: { id: sessionId, restaurantId } });
  if (!tableSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  await prisma.tableSession.update({
    where: { id: sessionId },
    data: { isActive: false, closedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
