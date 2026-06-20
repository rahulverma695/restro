import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { name, email, password, role, restaurantId } = await req.json();
  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role, restaurantId },
  });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
