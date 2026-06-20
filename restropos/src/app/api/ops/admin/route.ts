import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const opsKey = req.headers.get("x-ops-key") || req.nextUrl.searchParams.get("key");
  if (opsKey !== process.env.OPS_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const sevenDaysAgo  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const today = new Date(now); today.setHours(0,0,0,0);

  // All restaurants with their stats
  const restaurants = await prisma.restaurant.findMany({
    include: {
      _count: { select: { orders: true, menuItems: true, customers: true, users: true, tables: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Per-restaurant revenue and recent order counts
  const restaurantStats = await Promise.all(restaurants.map(async (r) => {
    const [totalRevenue, revenueThisMonth, ordersToday, ordersThisWeek, lastOrder] = await Promise.all([
      prisma.order.aggregate({ where: { restaurantId: r.id, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { restaurantId: r.id, status: { not: "CANCELLED" }, createdAt: { gte: thirtyDaysAgo } }, _sum: { total: true } }),
      prisma.order.count({ where: { restaurantId: r.id, createdAt: { gte: today } } }),
      prisma.order.count({ where: { restaurantId: r.id, createdAt: { gte: sevenDaysAgo } } }),
      prisma.order.findFirst({ where: { restaurantId: r.id }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    ]);
    return {
      id: r.id,
      name: r.name,
      address: r.address,
      phone: r.phone,
      gstin: r.gstin,
      createdAt: r.createdAt,
      totalOrders: r._count.orders,
      menuItems: r._count.menuItems,
      customers: r._count.customers,
      staff: r._count.users,
      tables: r._count.tables,
      totalRevenue: totalRevenue._sum.total || 0,
      revenueThisMonth: revenueThisMonth._sum.total || 0,
      ordersToday,
      ordersThisWeek,
      lastOrderAt: lastOrder?.createdAt || null,
      isActive: ordersThisWeek > 0,
    };
  }));

  // Platform totals
  const [totalOrders, totalRevenue, totalCustomers, recentSignups] = await Promise.all([
    prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.customer.count(),
    prisma.restaurant.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { id: true, name: true, createdAt: true, phone: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Order source breakdown
  const orderSources = await prisma.order.groupBy({
    by: ["source"],
    _count: true,
    where: { status: { not: "CANCELLED" } },
  });

  // Daily order trend (last 14 days)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const recentOrders = await prisma.order.findMany({
    where: { createdAt: { gte: twoWeeksAgo }, status: { not: "CANCELLED" } },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: "asc" },
  });

  const dailyMap: Record<string, { orders: number; revenue: number }> = {};
  recentOrders.forEach(o => {
    const day = o.createdAt.toISOString().slice(0, 10);
    if (!dailyMap[day]) dailyMap[day] = { orders: 0, revenue: 0 };
    dailyMap[day].orders += 1;
    dailyMap[day].revenue += o.total;
  });
  const dailyTrend = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }));

  // Health checks summary
  const latestChecks = await prisma.healthCheck.findMany({
    orderBy: { checkedAt: "desc" },
    take: 50,
  });
  const endpointNames = [...new Set(latestChecks.map(c => c.endpoint))];
  const healthSummary = endpointNames.map(name => {
    const checks = latestChecks.filter(c => c.endpoint === name);
    const latest = checks[0];
    const uptime = checks.length > 0 ? Math.round((checks.filter(c => c.ok).length / checks.length) * 100) : 100;
    return { name, ok: latest?.ok ?? true, lastMs: latest?.responseMs ?? 0, uptime };
  });

  return NextResponse.json({
    platform: {
      totalRestaurants: restaurants.length,
      activeRestaurants: restaurantStats.filter(r => r.isActive).length,
      newThisWeek: recentSignups.length,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalCustomers,
    },
    restaurants: restaurantStats,
    recentSignups,
    orderSources,
    dailyTrend,
    health: healthSummary,
    generatedAt: now.toISOString(),
  });
}
