import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();
  try {
    // Lightweight query — just count restaurants
    const count = await prisma.restaurant.count();
    const ms = Date.now() - start;
    return NextResponse.json({ ok: true, responseMs: ms, restaurants: count });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
