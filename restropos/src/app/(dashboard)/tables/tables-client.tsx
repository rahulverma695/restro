"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Plus, Users, QrCode, RefreshCw, Shield } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; bg: string; border: string; dot: string }> = {
  AVAILABLE: { label: "Available", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)",  dot: "#10b981" },
  OCCUPIED:  { label: "Occupied",  bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.25)", dot: "#f97316" },
  RESERVED:  { label: "Reserved",  bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)",  dot: "#f59e0b" },
  CLEANING:  { label: "Cleaning",  bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.2)", dot: "#6b7280" },
};

export function TablesClient({ tables, restaurantId }: { tables: any[]; restaurantId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ number: "", capacity: "4", section: "" });
  const [loading, setLoading] = useState(false);
  const sections = [...new Set(tables.map(t => t.section).filter(Boolean))] as string[];

  async function addTable() {
    if (!form.number) return;
    setLoading(true);
    await fetch("/api/tables", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, capacity: Number(form.capacity), restaurantId }),
    });
    setLoading(false); setOpen(false);
    setForm({ number: "", capacity: "4", section: "" });
    router.refresh();
  }

  async function updateStatus(tableId: string, status: string) {
    await fetch(`/api/tables/${tableId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  const counts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map(s => [s, tables.filter(t => t.status === s).length])
  );

  return (
    <div className="p-5 space-y-5 max-w-[1100px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-white/90">Tables</h1>
          <p className="text-[12px] text-white/30 mt-0.5">{tables.length} tables</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-3.5 h-3.5" /> Add Table</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Table</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div><label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1">Number *</label>
                <Input placeholder="T11" value={form.number} onChange={e => setForm({...form, number: e.target.value})} /></div>
              <div><label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1">Capacity</label>
                <Input type="number" min={1} value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
              <div><label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1">Section</label>
                <Input placeholder="Ground Floor" value={form.section} onChange={e => setForm({...form, section: e.target.value})} /></div>
              <Button onClick={addTable} disabled={loading || !form.number} className="w-full">
                {loading ? "Adding..." : "Add Table"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([status, { label, dot }]) => (
          <div key={status} className="rounded-lg bg-[#111] border border-white/[0.07] px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: dot }} />
              <span className="text-[11px] text-white/40">{label}</span>
            </div>
            <p className="text-[24px] font-semibold text-white/80 tabular">{counts[status] || 0}</p>
          </div>
        ))}
      </div>

      {/* Tables grid */}
      {sections.length > 0 ? sections.map(section => (
        <div key={section}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">{section}</span>
            <div className="flex-1 h-px bg-white/[0.05]" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
            {tables.filter(t => t.section === section).map(table => (
              <TableCard key={table.id} table={table} onStatusChange={updateStatus} />
            ))}
          </div>
        </div>
      )) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
          {tables.map(table => <TableCard key={table.id} table={table} onStatusChange={updateStatus} />)}
        </div>
      )}
    </div>
  );
}

function TableCard({ table, onStatusChange }: { table: any; onStatusChange: (id: string, status: string) => void }) {
  const cfg = STATUS_CONFIG[table.status] || STATUS_CONFIG.AVAILABLE;
  const activeOrder = table.orders?.[0];
  const total = activeOrder?.items?.reduce((s: number, i: any) => s + i.price * i.quantity, 0) || 0;
  const [qrData, setQrData] = useState<{ qr: string; url: string; pin: string; expiresAt: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  async function loadQR() {
    setQrLoading(true);
    // Each QR load generates a fresh session + new PIN (invalidates prior session)
    const res = await fetch(`/api/tables/${table.id}/qr`);
    setQrData(await res.json());
    setQrLoading(false);
  }

  function handleQrOpen(open: boolean) {
    setQrOpen(open);
    if (open) loadQR();
    else setQrData(null);
  }

  return (
    <div className="rounded-lg border p-3 transition-all" style={{ background: cfg.bg, borderColor: cfg.border }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[16px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{table.number}</span>
        <div className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
      </div>
      <div className="flex items-center gap-1 mb-2" style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>
        <Users className="w-2.5 h-2.5" />{table.capacity} seats
      </div>
      {total > 0 && <p className="text-[11px] font-semibold tabular mb-2" style={{ color: "#f97316" }}>{formatCurrency(total)}</p>}

      <div className="space-y-1">
        {table.status === "OCCUPIED" && (
          <button onClick={() => onStatusChange(table.id, "CLEANING")}
            className="w-full text-[10px] font-medium py-1 rounded bg-white/[0.06] hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
            Cleaning
          </button>
        )}
        {table.status === "CLEANING" && (
          <button onClick={() => onStatusChange(table.id, "AVAILABLE")}
            className="w-full text-[10px] font-medium py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors">
            Available
          </button>
        )}
        {table.status === "AVAILABLE" && (
          <button onClick={() => onStatusChange(table.id, "RESERVED")}
            className="w-full text-[10px] font-medium py-1 rounded bg-white/[0.06] hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
            Reserve
          </button>
        )}
        {table.status === "RESERVED" && (
          <button onClick={() => onStatusChange(table.id, "AVAILABLE")}
            className="w-full text-[10px] font-medium py-1 rounded bg-white/[0.06] hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
            Cancel
          </button>
        )}

        <Dialog open={qrOpen} onOpenChange={handleQrOpen}>
          <DialogTrigger asChild>
            <button
              className="w-full text-[10px] font-medium py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/30 hover:text-white/60 flex items-center justify-center gap-1 transition-colors">
              <QrCode className="w-2.5 h-2.5" /> QR
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <DialogHeader><DialogTitle>Table {table.number} — Secure QR</DialogTitle></DialogHeader>
            <div className="text-center space-y-3 py-2">
              {qrLoading ? (
                <div className="h-40 flex items-center justify-center text-[12px] text-white/30">Generating session...</div>
              ) : qrData ? (
                <>
                  <img src={qrData.qr} alt="QR" className="w-44 h-44 mx-auto rounded-lg" />

                  {/* PIN badge — steward reads this to the customer */}
                  <div className="bg-orange-500/10 border border-orange-500/25 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-orange-400" />
                      <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wide">Steward Table PIN</p>
                    </div>
                    <p className="text-4xl font-black tracking-[0.3em] text-white tabular-nums">{qrData.pin}</p>
                    <p className="text-[10px] text-white/30 mt-2">Tell this code to your customer to activate their order</p>
                  </div>

                  <p className="text-[10px] text-white/30">Expires: {new Date(qrData.expiresAt).toLocaleTimeString()}</p>

                  <div className="flex gap-2">
                    <a href={qrData.qr} download={`table-${table.number}-qr.png`} className="flex-1">
                      <Button size="sm" className="w-full">Download QR</Button>
                    </a>
                    <Button size="sm" variant="outline" onClick={loadQR} className="gap-1">
                      <RefreshCw className="w-3 h-3" /> New PIN
                    </Button>
                  </div>
                  <p className="text-[9px] text-white/20">"New PIN" generates a fresh session and invalidates the old one</p>
                </>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
