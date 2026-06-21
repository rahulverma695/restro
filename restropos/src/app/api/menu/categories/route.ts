import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.restaurantId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { restaurantId } = session.user;

  const { name } = await req.json();
  const cat = await prisma.category.create({ data: { name, restaurantId } });
  revalidateTag(`menu-${restaurantId}`, "max");
  return NextResponse.json(cat);
}
