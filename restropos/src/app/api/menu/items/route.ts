import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const CreateMenuItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive(),
  categoryId: z.string().min(1),
  isVeg: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  image: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.restaurantId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { restaurantId } = session.user;

  const body = await req.json();
  const parsed = CreateMenuItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, price, description, isVeg, categoryId } = parsed.data;
  const { variants } = body;

  const item = await prisma.menuItem.create({
    data: { name, price, description: description || null, isVeg, categoryId, restaurantId },
  });

  if (variants?.length) {
    for (const v of variants) {
      await prisma.variant.create({ data: { name: v.name, price: Number(v.price), menuItemId: item.id } });
    }
  }

  revalidateTag(`menu-${restaurantId}`, "max");
  return NextResponse.json(item);
}
