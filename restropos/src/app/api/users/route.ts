import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.restaurantId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name, email, password, role } = await req.json();
  if (role === 'OWNER' && session.user.role !== 'OWNER') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role, restaurantId: session.user.restaurantId },
  });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
