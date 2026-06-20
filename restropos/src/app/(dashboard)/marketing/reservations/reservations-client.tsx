"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, Calendar, Users, Phone, CheckCircle, Clock, Check, X, ShieldAlert, Table, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";

type TableData = {
  id: string;
  number: string;
  capacity: number;
  status: string;
  section: string | null;
};

type Reservation = {
  id: string;
  guestName: string;
  guestPhone: string;
  guestCount: number;
  dateTime: string;
  tableId: string | null;
  table: TableData | null;
  status: "PENDING" | "CONFIRMED" | "SEATED" | "CANCELLED";
  notes: string | null;
  orderId?: string | null;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: number;
    total: number;
    items: {
      id: string;
      quantity: number;
      price: number;
      notes: string | null;
      menuItem: {
        id: string;
        name: string;
        price: number;
      };
    }[];
  } | null;
  createdAt: string;
};

export function ReservationsClient({
  initialReservations,
  tables,
  restaurantId,
}: {
  initialReservations: Reservation[];
  tables: TableData[];
  restaurantId: string;
}) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [filter, setFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredReservations = reservations.filter(res => {
    if (filter === "ALL") return true;
    return res.status === filter;
  });

  async function updateStatus(id: string, status: string, tableId?: string | null) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, tableId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReservations(prev => prev.map(o => o.id === id ? { ...o, status: updated.status, tableId: updated.tableId, table: updated.table } : o));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDateTime(isoString: string) {
    const d = new Date(isoString);
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div className="p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-orange-500" /> Dining Reservations
        </h1>
      </div>

      {tables.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-400 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="font-bold">No Dining Tables Configured</p>
            <p className="mt-0.5 text-slate-400">Please navigate to the <Link href="/tables" className="underline font-semibold text-orange-500 hover:text-orange-400">Tables Section</Link> to add your restaurant's physical dining tables before you can assign tables to reservations.</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 rounded-xl p-1 bg-white/5 border border-white/10 w-fit flex-wrap">
        {["ALL", "PENDING", "CONFIRMED", "SEATED", "CANCELLED"].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all uppercase ${
              filter === tab ? "bg-orange-500 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reservations List */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Guest Details</th>
                <th className="px-6 py-4">Guests</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned Table</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-white">
              {filteredReservations.map(res => (
                <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{res.guestName}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3" /> {res.guestPhone}
                    </div>
                    {res.notes && <div className="text-[11px] text-orange-300 mt-1 italic">Note: "{res.notes}"</div>}
                    {res.order && (
                      <div className="mt-2.5 bg-orange-500/[0.03] border border-orange-500/15 rounded-xl p-3 max-w-xs space-y-1.5">
                        <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                          <ChefHat className="w-3.5 h-3.5" /> Advance Pre-Order
                        </div>
                        <div className="divide-y divide-white/5">
                          {res.order.items.map((item: any) => (
                            <div key={item.id} className="text-[11px] text-slate-300 py-1 flex justify-between items-center">
                              <span>{item.menuItem.name} <span className="text-slate-500 font-bold ml-1">x{item.quantity}</span></span>
                              <span className="text-orange-400/95 font-bold">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-white/5 pt-1.5 flex justify-between text-[11px] font-bold text-white">
                          <span>Total</span>
                          <span>₹{res.order.total}</span>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {res.guestCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-medium">
                    {formatDateTime(res.dateTime)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border ${
                        res.status === "SEATED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : res.status === "CONFIRMED"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : res.status === "CANCELLED"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {res.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {res.status === "SEATED" ? (
                      <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <Table className="w-3.5 h-3.5" /> Table {res.table?.number}
                      </div>
                    ) : res.status === "CANCELLED" ? (
                      <span className="text-xs text-slate-500">—</span>
                    ) : (
                      <select
                        disabled={updatingId === res.id || tables.length === 0}
                        value={res.tableId || ""}
                        onChange={e => updateStatus(res.id, res.status, e.target.value || null)}
                        className="h-8 rounded-lg px-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white/5 border border-white/10 text-white cursor-pointer"
                      >
                        <option className="bg-[#1a1a1a]" value="">
                          {tables.length === 0 ? "No Tables Configured" : "Select Table..."}
                        </option>
                        {tables.map(t => (
                          <option key={t.id} className="bg-[#1a1a1a]" value={t.id}>
                            T{t.number} ({t.capacity} pax)
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {updatingId === res.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                      ) : (
                        <>
                          {res.status === "PENDING" && (
                            <button
                              onClick={() => updateStatus(res.id, "CONFIRMED", res.tableId)}
                              className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center transition-colors"
                              title="Confirm Booking"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {res.status !== "SEATED" && res.status !== "CANCELLED" && (
                            <button
                              disabled={!res.tableId}
                              onClick={() => updateStatus(res.id, "SEATED", res.tableId)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                res.tableId
                                  ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400"
                                  : "bg-slate-500/5 text-slate-500 cursor-not-allowed"
                              }`}
                              title={res.tableId ? "Seat Customer Now" : "Assign a table first to Seat guest"}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {res.status !== "CANCELLED" && res.status !== "SEATED" && (
                            <button
                              onClick={() => updateStatus(res.id, "CANCELLED", null)}
                              className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors"
                              title="Cancel Booking"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500">
                    No reservations matching the "{filter.toLowerCase()}" filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
