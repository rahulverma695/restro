import { NextRequest, NextResponse } from "next/server";
import { basePrisma } from "@/lib/prisma";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RegisterRestaurantSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  restaurantName: z.string().min(1).max(100),
  phone: z.string().max(15).optional(),
});

export async function POST(req: NextRequest) {
  const { allowed, retryAfter } = await checkRateLimit(getClientIp(req), 3, "1 m");
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter ?? 60) } }
    );
  }

  try {
    const parsed = RegisterRestaurantSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { email, name, phone, restaurantName } = parsed.data;

    // Check if user already exists in public schema
    const existingUser = await basePrisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already registered in database" }, { status: 400 });
    }

    // 1. Create Restaurant record in public schema
    const restaurant = await basePrisma.restaurant.create({
      data: {
        name: restaurantName,
        phone: phone || null,
        address: "",
        gstin: "",
      }
    });

    // 2. Create User record in public schema linked to restaurant
    const user = await basePrisma.user.create({
      data: {
        name: name,
        email: email,
        password: "", // Handled by Neon Auth
        role: "OWNER",
        restaurantId: restaurant.id,
      }
    });

    // 3. Create default menu category
    await basePrisma.category.create({
      data: {
        name: "General",
        restaurantId: restaurant.id,
      }
    });

    // 4. Create default table
    await basePrisma.table.create({
      data: {
        number: "1",
        capacity: 4,
        restaurantId: restaurant.id,
      }
    });

    return NextResponse.json({ success: true, restaurantId: restaurant.id, userId: user.id });
  } catch (error: any) {
    console.error("Restaurant registration error:", error);
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}
