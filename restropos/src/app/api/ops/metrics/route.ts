import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const opsKey = req.headers.get("x-ops-key") || req.nextUrl.searchParams.get("key");
  if (opsKey !== process.env.OPS_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const oneDayAgo   = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalRestaurants,
    newThisWeek,
    newThisMonth,
    totalOrders,
    ordersThisWeek,
    activeRestaurants,
    recentChecks,
    checksLast24h,
    checksLast7d,
    recentErrors,
  ] = await Promise.all([
    prisma.restaurant.count(),
    prisma.restaurant.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.restaurant.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    // Restaurants that placed an order in last 7 days
    prisma.order.groupBy({ by: ["restaurantId"], where: { createdAt: { gte: sevenDaysAgo } } }).then(r => r.length),
    // Last 10 health checks per endpoint
    prisma.healthCheck.findMany({
      orderBy: { checkedAt: "desc" },
      take: 100,
    }),
    // Uptime last 24h
    prisma.healthCheck.findMany({ where: { checkedAt: { gte: oneDayAgo } } }),
    // Uptime last 7d
    prisma.healthCheck.findMany({ where: { checkedAt: { gte: sevenDaysAgo } } }),
    // Recent errors
    prisma.errorLog.findMany({ orderBy: { occurredAt: "desc" }, take: 20 }),
  ]);

  // Calculate uptime per endpoint
  const endpointNames = [...new Set(checksLast7d.map(c => c.endpoint))];
  const uptimeStats = endpointNames.map(name => {
    const checks24h = checksLast24h.filter(c => c.endpoint === name);
    const checks7d  = checksLast7d.filter(c => c.endpoint === name);
    const uptime24h = checks24h.length > 0 ? (checks24h.filter(c => c.ok).length / checks24h.length) * 100 : 100;
    const uptime7d  = checks7d.length > 0  ? (checks7d.filter(c => c.ok).length / checks7d.length) * 100 : 100;
    const avgMs     = checks24h.length > 0 ? Math.round(checks24h.reduce((s, c) => s + c.responseMs, 0) / checks24h.length) : 0;
    const latest    = recentChecks.find(c => c.endpoint === name);
    return { name, uptime24h: Math.round(uptime24h * 10) / 10, uptime7d: Math.round(uptime7d * 10) / 10, avgMs, status: latest?.ok ?? true, lastChecked: latest?.checkedAt };
  });

  // Response time trend (last 24h, grouped by hour)
  const hourlyTrend: Record<string, { total: number; count: number }> = {};
  checksLast24h.forEach(c => {
    const hour = new Date(c.checkedAt).toISOString().slice(0, 13);
    if (!hourlyTrend[hour]) hourlyTrend[hour] = { total: 0, count: 0 };
    hourlyTrend[hour].total += c.responseMs;
    hourlyTrend[hour].count += 1;
  });
  const responseTrend = Object.entries(hourlyTrend).map(([hour, v]) => ({
    hour, avgMs: Math.round(v.total / v.count),
  })).sort((a, b) => a.hour.localeCompare(b.hour));

  return NextResponse.json({
    platform: {
      totalRestaurants,
      newThisWeek,
      newThisMonth,
      totalOrders,
      ordersThisWeek,
      activeRestaurants,
    },
    uptime: uptimeStats,
    responseTrend,
    recentErrors: recentErrors.map(e => ({
      endpoint: e.endpoint,
      method: e.method,
      statusCode: e.statusCode,
      message: e.message,
      occurredAt: e.occurredAt,
    })),
    lastUpdated: now.toISOString(),
  });
}
