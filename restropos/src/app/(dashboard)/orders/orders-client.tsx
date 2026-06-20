"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BillPrint } from "@/components/bill-print";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Printer, ChevronRight } from "lucide-react";

const STATUS_FLOW: Record<string, string> = {
  PENDING: "CONFIRMED", CONFIRMED: "PREPARING", PREPARING: "READY",
  READY: "SERVED", SERVED: "COMPLETED",
};

const STATUS_DOT: Record<string, string> = {
  PENDING: "#f59e0b", CONFIRMED: "#3b82f6", PREPARING: "#f97316",
  READY: "#10b981", SERVED: "#6b7280", COMPLETED: "#374151", CANCELLED: "#ef4444",
};

const STATUS_BADGE: Record<string, any> = {
  PENDING: "warning", CONFIRMED: "blue", PREPARING: "default",
  READY: "success", SERVED: "secondary", COMPLETED: "secondary", CANCELLED: "destructive",
};

const FILTERS = ["ALL","PENDING","CONFIRMED","PREPARING","READY","COMPLETED","CANCELLED"];

export function OrdersClient({ orders, restaurant }: { orders: any[]; restaurant: any }) {
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState<string|null>(null);
  const [printOrder, setPrintOrder] = useState<any|null>(null);

  const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter);

  async function updateStatus(orderId: string, status: string) {
    setLoading(orderId);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="p-5 space-y-4 max-w-[1100px]">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold text-white/90">Orders</h1>
        <div className="flex gap-1 bg-white/[0.04] rounded-md p-0.5">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2.5 py-1.5 rounded text-[11px] font-medium transition-all ${filter===f ? "bg-orange-500/15 text-orange-400" : "text-white/30 hover:text-white/60"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-[#111] border border-white/[0.07] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[13px] text-white/20">No orders</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map(order => (
              <div key={order.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
                {/* Status dot */}
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_DOT[order.status] }} />

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-white/80 font-mono">{order.orderNumber}</span>
                    <Badge variant={STATUS_BADGE[order.status]}>{order.status}</Badge>
                    <Badge variant="outline">{order.type.replace("_"," ")}</Badge>
                    {order.source === "TABLE_QR" && <Badge variant="success">📱 Table QR</Badge>}
                    {order.source !== "DIRECT" && order.source !== "TABLE_QR" && <Badge variant="secondary">{order.source}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {order.table && <span className="text-[11px] text-white/30">Table {order.table.number}</span>}
                    <span className="text-[11px] text-white/30">{order.user?.name}</span>
                    <span className="text-[11px] text-white/25">{format(new Date(order.createdAt), "dd MMM, hh:mm a")}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {order.items.map((item: any) => (
                      <span key={item.id} className="text-[10px] bg-white/[0.04] text-white/35 px-1.5 py-0.5 rounded">
                        {item.quantity}× {item.menuItem.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[14px] font-semibold text-white/80 tabular">{formatCurrency(order.total)}</p>
                    <p className="text-[10px] text-white/25">{order.payments[0]?.method}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setPrintOrder(order)}
                      className="h-7 w-7 rounded-md border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-all">
                      <Printer className="w-3 h-3" />
                    </button>
                    {STATUS_FLOW[order.status] && (
                      <button onClick={() => updateStatus(order.id, STATUS_FLOW[order.status])} disabled={loading===order.id}
                        className="h-7 px-2.5 rounded-md bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 text-[11px] font-semibold flex items-center gap-1 transition-all disabled:opacity-40">
                        {STATUS_FLOW[order.status]} <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                    {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
                      <button onClick={() => updateStatus(order.id, "CANCELLED")} disabled={loading===order.id}
                        className="h-7 px-2 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold transition-all disabled:opacity-40">
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!printOrder} onOpenChange={() => setPrintOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Bill / Invoice</DialogTitle></DialogHeader>
          {printOrder && <BillPrint order={printOrder} restaurant={restaurant} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
