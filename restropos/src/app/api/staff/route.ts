import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staffProfile.findMany({
    where: { restaurantId },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { joinDate: "desc" },
  });
  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, password, role, designation, phone, salary, shiftType, joinDate } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role || "CASHIER", restaurantId },
  });
  const profile = await prisma.staffProfile.create({
    data: {
      userId: user.id,
      restaurantId,
      designation: designation || null,
      phone: phone || null,
      salary: salary ? Number(salary) : null,
      shiftType: shiftType || "FULL_DAY",
      joinDate: joinDate ? new Date(joinDate) : new Date(),
    },
  });
  return NextResponse.json({ ...profile, user });
}
