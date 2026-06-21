import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, TrendingUp, ShoppingCart, Users, UtensilsCrossed, AlertTriangle } from "lucide-react";
import { DashboardCharts } from "./charts-loader";
import { format } from "date-fns";
import { LiveRefresh } from "@/components/live-refresh";

async function getData(restaurantId: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [todayOrders, activeOrders, totalCustomers, inventory, recentOrders] = await Promise.all([
    prisma.order.findMany({ where: { restaurantId, createdAt: { gte: today }, status: { not: "CANCELLED" } } }),
    prisma.order.findMany({
      where: { restaurantId, status: { in: ["PENDING","CONFIRMED","PREPARING","READY"] } },
      include: { table: true, items: { include: { menuItem: true } } },
      orderBy: { createdAt: "desc" }, take: 8,
    }),
    prisma.customer.count({ where: { restaurantId } }),
    prisma.inventoryItem.findMany({ where: { restaurantId } }),
    prisma.order.findMany({
      where: { restaurantId, createdAt: { gte: sevenDaysAgo }, status: { not: "CANCELLED" } },
      select: { createdAt: true, total: true }, orderBy: { createdAt: "asc" },
    }),
  ]);

  const lowStock = inventory.filter(i => i.quantity <= i.minQuantity);
  const dayMap: Record<string, { revenue: number; orders: number }> = {};
  recentOrders.forEach(o => {
    const day = format(new Date(o.createdAt), "EEE");
    if (!dayMap[day]) dayMap[day] = { revenue: 0, orders: 0 };
    dayMap[day].revenue += o.total;
    dayMap[day].orders += 1;
  });

  return {
    todayRevenue: todayOrders.reduce((s,o) => s + o.total, 0),
    todayCount: todayOrders.length,
    activeOrders,
    totalCustomers,
    lowStock,
    weeklyData: Object.entries(dayMap).map(([day, v]) => ({ day, ...v })),
  };
}

const STATUS_DOT: Record<string, string> = {
  PENDING: "#f59e0b", CONFIRMED: "#3b82f6", PREPARING: "#f97316",
  READY: "#10b981", SERVED: "#6b7280", COMPLETED: "#374151", CANCELLED: "#ef4444",
};

export default async function DashboardPage() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;
  const d = await getData(restaurantId);

  return (
    <div className="p-5 space-y-5 max-w-[1200px]">
      <LiveRefresh />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-white/90">Dashboard</h1>
          <p className="text-[12px] text-white/35 mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        {d.activeOrders.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 pulse" />
            <span className="text-[12px] font-medium text-orange-400">{d.activeOrders.length} active</span>
          </div>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Today's Revenue", value: formatCurrency(d.todayRevenue), icon: TrendingUp, accent: "#f97316" },
          { label: "Today's Orders",  value: String(d.todayCount),           icon: ShoppingCart, accent: "#3b82f6" },
          { label: "Active Orders",   value: String(d.activeOrders.length),  icon: UtensilsCrossed, accent: "#10b981" },
          { label: "Customers",       value: String(d.totalCustomers),       icon: Users, accent: "#8b5cf6" },
        ].map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="rounded-lg bg-[#111] border border-white/[0.07] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-white/40 uppercase tracking-wide font-medium">{label}</span>
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: accent + "18" }}>
                <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
              </div>
            </div>
            <p className="text-[22px] font-semibold text-white/90 tabular leading-none">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active orders */}
        <div className="lg:col-span-2 rounded-lg bg-[#111] border border-white/[0.07]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="text-[13px] font-semibold text-white/80">Active Orders</span>
            <a href="/orders" className="flex items-center gap-1 text-[11px] text-white/35 hover:text-orange-400 transition-colors">
              View all <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {d.activeOrders.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-white/25">No active orders</div>
            ) : d.activeOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="dot" style={{ background: STATUS_DOT[order.status] }} />
                  <div>
                    <p className="text-[13px] font-medium text-white/80">{order.orderNumber}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">
                      {order.type === "DINE_IN" ? `Table ${order.table?.number}` : order.type.replace("_"," ")} · {order.items.length} items
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-white/80 tabular">{formatCurrency(order.total)}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="rounded-lg bg-[#111] border border-white/[0.07]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[13px] font-semibold text-white/80">Low Stock</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {d.lowStock.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-white/25">All levels OK</div>
            ) : d.lowStock.map(item => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <p className="text-[13px] text-white/70">{item.name}</p>
                <span className="text-[11px] font-semibold text-amber-400 tabular">{item.quantity} {item.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DashboardCharts weeklyData={d.weeklyData} />
    </div>
  );
}
