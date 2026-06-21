import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const CreateStaffSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  designation: z.string().max(100).optional(),
  phone: z.string().max(15).optional(),
  salary: z.number().positive().optional(),
  shiftType: z.enum(["MORNING", "EVENING", "FULL_DAY"]).default("FULL_DAY"),
  joinDate: z.string().datetime().optional(),
});

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

  const parsed = CreateStaffSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, password, designation, phone, salary, shiftType, joinDate } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: "CASHIER", restaurantId },
  });
  const profile = await prisma.staffProfile.create({
    data: {
      userId: user.id,
      restaurantId,
      designation: designation || null,
      phone: phone || null,
      salary: salary ? Number(salary) : null,
      shiftType: shiftType,
      joinDate: joinDate ? new Date(joinDate) : new Date(),
    },
  });
  return NextResponse.json({ ...profile, user });
}
