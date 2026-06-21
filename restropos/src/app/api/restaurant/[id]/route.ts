import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.restaurantId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  if (session.user.restaurantId !== id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  const rawData = await req.json();
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = rawData;
  const restaurant = await prisma.restaurant.update({ where: { id }, data });
  return NextResponse.json(restaurant);
}
