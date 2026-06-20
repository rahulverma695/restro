import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  if (data.salary) data.salary = Number(data.salary);
  if (data.joinDate) data.joinDate = new Date(data.joinDate);
  const profile = await prisma.staffProfile.update({ where: { id }, data });
  return NextResponse.json(profile);
}
