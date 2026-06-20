"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Plus, Pencil, AlertTriangle, Package } from "lucide-react";

type InventoryItem = {
  id: string; name: string; unit: string; quantity: number;
  minQuantity: number; costPerUnit: number;
};

export function InventoryClient({ items, restaurantId }: { items: InventoryItem[]; restaurantId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({ name: "", unit: "kg", quantity: "", minQuantity: "", costPerUnit: "" });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = items.filter(i => i.quantity <= i.minQuantity);

  function openAdd() {
    setEditItem(null);
    setForm({ name: "", unit: "kg", quantity: "", minQuantity: "", costPerUnit: "" });
    setOpen(true);
  }

  function openEdit(item: InventoryItem) {
    setEditItem(item);
    setForm({ name: item.name, unit: item.unit, quantity: String(item.quantity), minQuantity: String(item.minQuantity), costPerUnit: String(item.costPerUnit) });
    setOpen(true);
  }

  async function save() {
    setLoading(true);
    const url = editItem ? `/api/inventory/${editItem.id}` : "/api/inventory";
    await fetch(url, {
      method: editItem ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, quantity: Number(form.quantity), minQuantity: Number(form.minQuantity), costPerUnit: Number(form.costPerUnit), restaurantId }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="p-5 space-y-4 max-w-[1100px]">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>Inventory</h1>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5" /> Add Item</Button>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-lg px-4 py-3 flex items-start gap-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }} />
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "#f59e0b" }}>{lowStock.length} item{lowStock.length > 1 ? "s" : ""} below minimum stock</p>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {lowStock.map(i => (
                <span key={i.id} className="text-[11px] px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                  {i.name}: {i.quantity} {i.unit}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>{filtered.length} items</span>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
        <table className="w-full text-[13px]">
          <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <tr>
              {["Item", "Unit", "Quantity", "Min Stock", "Cost/Unit", "Status", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => {
              const isLow = item.quantity <= item.minQuantity;
              return (
                <tr key={item.id} style={{ borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
                      <span className="font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.4)" }}>{item.unit}</td>
                  <td className="px-4 py-3 font-semibold tabular" style={{ color: isLow ? "#f59e0b" : "rgba(255,255,255,0.75)" }}>{item.quantity}</td>
                  <td className="px-4 py-3 tabular" style={{ color: "rgba(255,255,255,0.35)" }}>{item.minQuantity}</td>
                  <td className="px-4 py-3 tabular" style={{ color: "rgba(255,255,255,0.5)" }}>{formatCurrency(item.costPerUnit)}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={
                      isLow
                        ? { background: "rgba(239,68,68,0.12)", color: "#ef4444" }
                        : { background: "rgba(16,185,129,0.12)", color: "#10b981" }
                    }>
                      {isLow ? "Low Stock" : "OK"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(item)} style={{ color: "rgba(255,255,255,0.25)" }} className="hover:text-white/70 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-[13px]" style={{ color: "rgba(255,255,255,0.2)" }}>No inventory items</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Item" : "Add Inventory Item"}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-[11px] uppercase tracking-wide block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Name *</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Tomatoes" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wide block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Unit</label>
                <select className="w-full h-8 px-2.5 rounded-md text-[13px] focus:outline-none focus:border-orange-500"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
                  value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  {["kg","g","L","ml","pcs","dozen","box"].map(u => <option key={u} style={{ background: "#1a1a1a" }}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wide block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Cost/Unit (₹)</label>
                <Input type="number" value={form.costPerUnit} onChange={e => setForm({ ...form, costPerUnit: e.target.value })} placeholder="50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wide block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Quantity</label>
                <Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="10" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wide block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Min Quantity</label>
                <Input type="number" value={form.minQuantity} onChange={e => setForm({ ...form, minQuantity: e.target.value })} placeholder="2" />
              </div>
            </div>
            <Button onClick={save} disabled={loading || !form.name} className="w-full">
              {loading ? "Saving..." : editItem ? "Update" : "Add Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
