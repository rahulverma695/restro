import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { restaurantId } = await req.json();
    if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

    // 1. Check/create default categories
    let categories = await prisma.category.findMany({ where: { restaurantId } });
    if (categories.length === 0) {
      const defaultCats = [
        { name: "Starters", sortOrder: 1 },
        { name: "Mains", sortOrder: 2 },
        { name: "Drinks", sortOrder: 3 },
        { name: "Desserts", sortOrder: 4 },
      ];
      for (const cat of defaultCats) {
        await prisma.category.create({
          data: { ...cat, restaurantId },
        });
      }
      categories = await prisma.category.findMany({ where: { restaurantId } });
    }

    // 2. Check/create default menu items
    const menuItems = await prisma.menuItem.findMany({ where: { restaurantId } });
    if (menuItems.length === 0) {
      const starters = categories.find(c => c.name === "Starters");
      const mains = categories.find(c => c.name === "Mains");
      const drinks = categories.find(c => c.name === "Drinks");
      const desserts = categories.find(c => c.name === "Desserts");

      const items = [
        { name: "Paneer Tikka", price: 220, categoryId: starters?.id, isVeg: true },
        { name: "Veg Spring Rolls", price: 180, categoryId: starters?.id, isVeg: true },
        { name: "Chicken Tikka Kebab", price: 280, categoryId: starters?.id, isVeg: false },
        { name: "Butter Chicken", price: 340, categoryId: mains?.id, isVeg: false },
        { name: "Paneer Butter Masala", price: 280, categoryId: mains?.id, isVeg: true },
        { name: "Garlic Naan", price: 60, categoryId: mains?.id, isVeg: true },
        { name: "Jeera Rice", price: 140, categoryId: mains?.id, isVeg: true },
        { name: "Fresh Lime Soda", price: 90, categoryId: drinks?.id, isVeg: true },
        { name: "Masala Chai", price: 40, categoryId: drinks?.id, isVeg: true },
        { name: "Hot Fudge Brownie", price: 180, categoryId: desserts?.id, isVeg: true },
      ];

      for (const item of items) {
        if (item.categoryId) {
          await prisma.menuItem.create({
            data: {
              name: item.name,
              price: item.price,
              categoryId: item.categoryId,
              restaurantId,
              isVeg: item.isVeg,
              isAvailable: true,
            },
          });
        }
      }
    }

    // 3. Ensure at least 10 tables exist
    let tables = await prisma.table.findMany({ where: { restaurantId } });
    if (tables.length < 10) {
      const needed = 10 - tables.length;
      const startNum = tables.length + 1;
      for (let i = 0; i < needed; i++) {
        const num = startNum + i;
        await prisma.table.create({
          data: {
            number: `T${num}`,
            capacity: num % 2 === 0 ? 4 : (num % 3 === 0 ? 6 : 2),
            section: "Main Hall",
            restaurantId,
            status: "AVAILABLE",
          },
        });
      }
      tables = await prisma.table.findMany({ where: { restaurantId } });
    }

    return NextResponse.json({ success: true, seeded: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { restaurantId } = await req.json();
    if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

    // Find all simulation orders
    const simOrders = await prisma.order.findMany({
      where: { restaurantId, notes: "Simulation Load Test" },
      select: { id: true, tableId: true },
    });

    const simOrderIds = simOrders.map(o => o.id);

    // 1. Delete associated payments
    await prisma.payment.deleteMany({
      where: { orderId: { in: simOrderIds } },
    });

    // 2. Delete associated order items
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: simOrderIds } },
    });

    // 3. Delete orders
    await prisma.order.deleteMany({
      where: { id: { in: simOrderIds } },
    });

    // 4. Reset all tables to AVAILABLE
    await prisma.table.updateMany({
      where: { restaurantId },
      data: { status: "AVAILABLE" },
    });

    return NextResponse.json({ success: true, purged: true, count: simOrderIds.length });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
