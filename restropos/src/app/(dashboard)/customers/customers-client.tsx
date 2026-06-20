"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Plus, Star } from "lucide-react";
import { format } from "date-fns";

type Customer = { id: string; name: string; phone: string; email: string | null; loyaltyPoints: number; createdAt: Date; _count: { orders: number } };

export function CustomersClient({ customers, restaurantId }: { customers: Customer[]; restaurantId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  async function addCustomer() {
    setLoading(true);
    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, restaurantId }),
    });
    setLoading(false);
    setOpen(false);
    setForm({ name: "", phone: "", email: "" });
    router.refresh();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Add Customer</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Customers", value: customers.length },
          { label: "Total Orders", value: customers.reduce((s, c) => s + c._count.orders, 0) },
          { label: "Total Loyalty Points", value: customers.reduce((s, c) => s + c.loyaltyPoints, 0) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl p-4 text-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
          </div>
        ))}
      </div>

      <Input
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <tr>
              {["Customer", "Phone", "Email", "Orders", "Loyalty Pts", "Since"].map((h, i) => (
                <th key={h} className={`px-4 py-3 font-medium text-xs ${i >= 3 && i <= 4 ? "text-center" : "text-left"}`}
                  style={{ color: "rgba(255,255,255,0.6)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = ""}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {c.name[0].toUpperCase()}
                    </div>
                    <span className="font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.7)" }}>{c.phone}</td>
                <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.5)" }}>{c.email || "—"}</td>
                <td className="px-4 py-3 text-center font-semibold text-white">{c._count.orders}</td>
                <td className="px-4 py-3 text-center">
                  <span className="flex items-center justify-center gap-1 text-amber-400">
                    <Star className="w-3 h-3" />{c.loyaltyPoints}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.5)" }}>{format(new Date(c.createdAt), "dd MMM yyyy")}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12" style={{ color: "rgba(255,255,255,0.4)" }}>No customers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Priya Sharma" />
            </div>
            <div>
              <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>Phone *</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="priya@email.com" />
            </div>
            <Button onClick={addCustomer} disabled={loading || !form.name || !form.phone} className="w-full">
              {loading ? "Adding..." : "Add Customer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
