"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Wifi, ShoppingBag } from "lucide-react";

const SOURCE_COLOR: Record<string, { bg: string; color: string }> = {
  ZOMATO:  { bg: "rgba(239,68,68,0.15)",   color: "#f87171" },
  SWIGGY:  { bg: "rgba(249,115,22,0.15)",  color: "#fb923c" },
  WEBSITE: { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa" },
  PHONE:   { bg: "rgba(168,85,247,0.15)",  color: "#c084fc" },
  PRE_ORDER: { bg: "rgba(16,185,129,0.15)", color: "#34d399" },
};

const STATUS_FLOW: Record<string, string> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
};

export function OnlineOrdersClient({ orders, restaurantId }: { orders: any[]; restaurantId: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.source === filter);

  const stats = {
    ZOMATO: orders.filter((o) => o.source === "ZOMATO").length,
    SWIGGY: orders.filter((o) => o.source === "SWIGGY").length,
    WEBSITE: orders.filter((o) => o.source === "WEBSITE").length,
    PHONE: orders.filter((o) => o.source === "PHONE").length,
    PRE_ORDER: orders.filter((o) => o.source === "PRE_ORDER").length,
  };

  async function updateStatus(orderId: string, status: string) {
    setLoading(orderId);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Wifi className="w-6 h-6 text-orange-500" />
        <h1 className="text-2xl font-bold text-white">Online Orders</h1>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(stats).map(([platform, count]) => (
          <div key={platform} className="rounded-xl p-4 text-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-2xl font-bold text-white">{count}</p>
            <p className="text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block"
              style={{ background: SOURCE_COLOR[platform]?.bg, color: SOURCE_COLOR[platform]?.color }}>
              {platform === "PRE_ORDER" ? "PRE-ORDER" : platform}
            </p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["ALL", "ZOMATO", "SWIGGY", "WEBSITE", "PHONE", "PRE_ORDER"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s ? "bg-orange-500 text-white" : ""
            }`}
            style={filter !== s ? { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" } : {}}
          >
            {s === "PRE_ORDER" ? "PRE-ORDERS" : s}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.4)" }}>
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No online orders yet</p>
            <p className="text-xs mt-1">Orders from Zomato, Swiggy, and your website will appear here</p>
          </div>
        )}
        {filtered.map((order) => (
          <div key={order.id} className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-white">{order.orderNumber}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: SOURCE_COLOR[order.source]?.bg, color: SOURCE_COLOR[order.source]?.color }}>
                    {order.source}
                  </span>
                  <Badge variant="outline">{order.status}</Badge>
                </div>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {format(new Date(order.createdAt), "dd MMM, hh:mm a")}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {order.items.map((item: any) => (
                    <span key={item.id} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                      {item.quantity}x {item.menuItem.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-lg text-orange-500">{formatCurrency(order.total)}</p>
                <div className="mt-2 flex gap-2 justify-end">
                  {STATUS_FLOW[order.status] && (
                    <Button size="sm" onClick={() => updateStatus(order.id, STATUS_FLOW[order.status])} disabled={loading === order.id}>
                      → {STATUS_FLOW[order.status]}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
