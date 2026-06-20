"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Calendar, Tag, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";

type Offer = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  value: number;
  minBillAmount: number;
  maxDiscount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export function OffersTab({ restaurantId }: { restaurantId: string }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    code: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FLAT",
    value: "",
    minBillAmount: "",
    maxDiscount: "",
    endDate: "",
  });

  useEffect(() => {
    fetchOffers();
  }, [restaurantId]);

  async function fetchOffers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/offers?restaurantId=${restaurantId}`);
      if (res.ok) {
        const data = await res.json();
        setOffers(data);
      }
    } catch (err) {
      console.error("Failed to fetch offers", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.code || !form.value || !form.endDate) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          restaurantId,
        }),
      });

      if (res.ok) {
        setForm({
          title: "",
          description: "",
          code: "",
          discountType: "PERCENTAGE",
          value: "",
          minBillAmount: "",
          maxDiscount: "",
          endDate: "",
        });
        await fetchOffers();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create offer");
      }
    } catch (err) {
      setError("Failed to create offer");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(offer: Offer) {
    try {
      const res = await fetch(`/api/offers/${offer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !offer.isActive }),
      });
      if (res.ok) {
        setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, isActive: !o.isActive } : o));
      }
    } catch (err) {
      console.error("Failed to toggle offer active state", err);
    }
  }

  async function deleteOffer(id: string) {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      const res = await fetch(`/api/offers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOffers(prev => prev.filter(o => o.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete offer", err);
    }
  }

  function formatINR(n: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Create Offer */}
      <div className="space-y-5">
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange-500" /> Create Custom Offer
          </h3>
          <p className="text-xs text-slate-400">Created offers are instantly visible to customers on the Dine-in PWA and QR menu checkout.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-1">Offer Title *</label>
              <Input placeholder="e.g. Happy Hour Special" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-1">Coupon Code *</label>
              <Input placeholder="e.g. HAPPY20" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-1">Discount Type</label>
                <select 
                  className="w-full h-10 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}
                  value={form.discountType}
                  onChange={e => setForm({ ...form, discountType: e.target.value as any })}
                >
                  <option className="bg-[#1e1e1e]" value="PERCENTAGE">Percentage (%)</option>
                  <option className="bg-[#1e1e1e]" value="FLAT">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-1">Discount Value *</label>
                <Input type="number" placeholder={form.discountType === "PERCENTAGE" ? "20" : "100"} value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-1">Min Bill Amount (₹)</label>
                <Input type="number" placeholder="Optional (e.g. 300)" value={form.minBillAmount} onChange={e => setForm({ ...form, minBillAmount: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-1">Max Discount (₹)</label>
                <Input type="number" placeholder="Optional (e.g. 150)" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} disabled={form.discountType === "FLAT"} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-1">Valid Till *</label>
                <Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-1">Description</label>
                <Input placeholder="e.g. Dine-in only" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4" /> Add Offer</>}
            </Button>
          </form>
        </div>
      </div>

      {/* Right: Active Offers List */}
      <div className="space-y-4 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <h3 className="font-semibold text-white text-base flex items-center gap-2">
          <Tag className="w-5 h-5 text-orange-500" /> Active Promotions ({offers.length})
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {offers.map(offer => {
              const isExpired = new Date(offer.endDate) < new Date();
              return (
                <div key={offer.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: offer.isActive && !isExpired ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.06)" }}>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{offer.title}</span>
                      <span className="text-xs bg-orange-500/10 text-orange-400 font-extrabold px-2 py-0.5 rounded-full border border-orange-500/20">{offer.code}</span>
                      {isExpired ? (
                        <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">Expired</span>
                      ) : offer.isActive ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Active</span>
                      ) : (
                        <span className="text-[10px] bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded-full">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{offer.description || "No description provided"}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-2">
                      <span>Discount: <strong>{offer.discountType === "PERCENTAGE" ? `${offer.value}%` : formatINR(offer.value)}</strong></span>
                      {offer.minBillAmount > 0 && <span>Min Order: <strong>{formatINR(offer.minBillAmount)}</strong></span>}
                      {offer.maxDiscount && <span>Max Cap: <strong>{formatINR(offer.maxDiscount)}</strong></span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(offer.endDate).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button onClick={() => toggleActive(offer)} className="text-slate-400 hover:text-white transition-colors" disabled={isExpired}>
                      {offer.isActive ? <ToggleRight className="w-6 h-6 text-orange-500" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                    <button onClick={() => deleteOffer(offer.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {offers.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">
                No offers created yet. Create one on the left panel!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
