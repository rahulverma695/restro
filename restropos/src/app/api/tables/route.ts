import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const CreateTableSchema = z.object({
  number: z.string().min(1).max(20),
  capacity: z.number().int().positive().max(100).default(4),
  section: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.restaurantId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { restaurantId } = session.user;

  const parsed = CreateTableSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { number, capacity, section } = parsed.data;
  const table = await prisma.table.create({
    data: { number, capacity, section, restaurantId },
  });
  return NextResponse.json(table);
}
