import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, otp, password } = await req.json();
  if (!email || !otp || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const record = await prisma.passwordReset.findFirst({
    where: { email, used: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return NextResponse.json({ error: "No reset request found. Please start over." }, { status: 400 });
  if (new Date() > record.expiresAt) {
    await prisma.passwordReset.delete({ where: { id: record.id } });
    return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 400 });
  }
  if (record.otp !== otp) return NextResponse.json({ error: "Incorrect code." }, { status: 400 });

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { email }, data: { password: hashed } });
  await prisma.passwordReset.update({ where: { id: record.id }, data: { used: true } });

  return NextResponse.json({ success: true });
}
