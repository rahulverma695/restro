import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.restaurantId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { restaurantId } = session.user;

  const { id } = await params;
  const existing = await prisma.menuItem.findUnique({ where: { id }, select: { restaurantId: true } });
  if (!existing || existing.restaurantId !== restaurantId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const data = await req.json();
  if (data.price) data.price = Number(data.price);
  const item = await prisma.menuItem.update({ where: { id }, data });

  revalidateTag(`menu-${restaurantId}`, "max");
  return NextResponse.json(item);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.restaurantId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { restaurantId } = session.user;

  const { id } = await params;
  const existing = await prisma.menuItem.findUnique({ where: { id }, select: { restaurantId: true } });
  if (!existing || existing.restaurantId !== restaurantId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.menuItem.delete({ where: { id } });
  revalidateTag(`menu-${restaurantId}`, "max");
  return NextResponse.json({ success: true });
}
