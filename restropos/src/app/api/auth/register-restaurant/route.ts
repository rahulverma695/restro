import { NextRequest, NextResponse } from "next/server";
import { basePrisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone, restaurantName } = await req.json();

    if (!email || !name || !restaurantName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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
