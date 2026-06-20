"use client";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { TrendingUp, ShoppingCart, CreditCard, Star, Download } from "lucide-react";

const PIE_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

export function ReportsClient({ orders, topItems, paymentBreakdown }: {
  orders: any[];
  topItems: { name: string; quantity: number }[];
  paymentBreakdown: { method: string; amount: number }[];
}) {
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const dailyData = useMemo(() => {
    const map: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach((o) => {
      const day = format(new Date(o.createdAt), "dd MMM");
      if (!map[day]) map[day] = { revenue: 0, orders: 0 };
      map[day].revenue += o.total;
      map[day].orders += 1;
    });
    return Object.entries(map).map(([day, v]) => ({ day, ...v }));
  }, [orders]);

  const typeBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => { map[o.type] = (map[o.type] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name.replace("_", " "), value }));
  }, [orders]);

  const paymentData = paymentBreakdown.map((p) => ({ name: p.method, value: p.amount }));

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  function exportGST() {
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    window.open(`/api/reports/gst-export?${params.toString()}`, "_blank");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Last 30 days</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-36 text-sm" />
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>to</span>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-36 text-sm" />
          <Button variant="outline" onClick={exportGST}>
            <Download className="w-4 h-4" /> Export GST CSV
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(249,115,22,0.15)" }}>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Total Revenue</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
              <ShoppingCart className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Total Orders</p>
              <p className="text-xl font-bold text-white">{totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
              <CreditCard className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Avg Order Value</p>
              <p className="text-xl font-bold text-white">{formatCurrency(avgOrderValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Revenue Chart */}
      <Card>
        <CardHeader><CardTitle className="text-base text-white">Daily Revenue (30 days)</CardTitle></CardHeader>
        <CardContent>
          {dailyData.length === 0 ? (
            <p className="text-center text-sm py-8" style={{ color: "rgba(255,255,255,0.4)" }}>No orders in this period</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} interval={Math.floor(dailyData.length / 10)} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                  formatter={(v) => [formatCurrency(Number(v)), "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#f97316" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Star className="w-4 h-4 text-amber-400" /> Top Selling Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topItems.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: "rgba(255,255,255,0.4)" }}>No data yet</p>
              )}
              {topItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm truncate max-w-[140px]" style={{ color: "rgba(255,255,255,0.85)" }}>{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{item.quantity} sold</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-base text-white">Payment Methods</CardTitle></CardHeader>
          <CardContent>
            {paymentData.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.4)" }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name }) => name}>
                    {paymentData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                    formatter={(v) => formatCurrency(Number(v))}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Order Type Breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-base text-white">Order Types</CardTitle></CardHeader>
          <CardContent>
            {typeBreakdown.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.4)" }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={typeBreakdown} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name }) => name}>
                    {typeBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
