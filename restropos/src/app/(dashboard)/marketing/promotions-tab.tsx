"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Tag, Percent, Check, ExternalLink } from "lucide-react";

type Customer = { id: string; name: string; phone: string };
type MenuItem = { id: string; name: string; price: number };

type OfferType = "flat_percent" | "item_offer";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
}

function cleanPhone(phone: string) {
  // Remove spaces, dashes, brackets. Add 91 if Indian number without country code
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function PromotionsTab({ customers, menuItems, restaurantName }: {
  customers: Customer[];
  menuItems: MenuItem[];
  restaurantName: string;
}) {
  const [offerType, setOfferType] = useState<OfferType>("flat_percent");
  const [flatPercent, setFlatPercent] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({}); // itemId -> discount%
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(true);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [sent, setSent] = useState<Set<string>>(new Set());

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.phone.includes(searchCustomer)
  );

  const targetCustomers = selectAll ? customers : customers.filter(c => selectedCustomers.has(c.id));

  function toggleItem(id: string) {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[id] !== undefined) delete next[id];
      else next[id] = 10; // default 10% off
      return next;
    });
  }

  function buildMessage(customer: Customer): string {
    const greeting = `Hi ${customer.name}! 👋`;
    const from = `*${restaurantName}*`;

    let offerLine = "";
    if (offerType === "flat_percent" && flatPercent) {
      offerLine = `🎉 *${flatPercent}% OFF* on your total bill!`;
      if (minOrder) offerLine += ` (Min order: ${formatINR(Number(minOrder))})`;
    } else if (offerType === "item_offer") {
      const items = Object.entries(selectedItems)
        .map(([id, pct]) => {
          const item = menuItems.find(m => m.id === id);
          return item ? `• ${item.name} — *${pct}% off* (now ${formatINR(item.price * (1 - pct / 100))})` : null;
        })
        .filter(Boolean)
        .join("\n");
      offerLine = `🍽 Special offer on selected items:\n${items}`;
    }

    const validity = validUntil ? `\n⏰ Valid until: ${new Date(validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}` : "";
    const extra = customMessage ? `\n\n${customMessage}` : "";
    const footer = `\n\nVisit us or scan your table QR to order. See you soon! 🙏`;

    return `${greeting}\n\nFrom ${from}:\n\n${offerLine}${validity}${extra}${footer}`;
  }

  function openWhatsApp(customer: Customer) {
    const msg = buildMessage(customer);
    const phone = cleanPhone(customer.phone);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setSent(prev => new Set([...prev, customer.id]));
  }

  function openWhatsAppBroadcast() {
    // Open first customer, user sends one by one
    if (targetCustomers.length === 0) return;
    openWhatsApp(targetCustomers[0]);
  }

  const previewMsg = targetCustomers.length > 0 ? buildMessage(targetCustomers[0]) : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Offer Builder */}
      <div className="space-y-5">
        {/* Offer Type */}
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "rgba(255,255,255,0.8)" }}>Offer Type</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setOfferType("flat_percent")}
              className={`p-4 rounded-xl border-2 text-left transition-all`}
              style={offerType === "flat_percent"
                ? { borderColor: "#f97316", background: "rgba(249,115,22,0.1)" }
                : { borderColor: "rgba(255,255,255,0.12)" }}>
              <Percent className="w-5 h-5 text-orange-500 mb-2" />
              <p className="font-semibold text-sm text-white">Flat % Off</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>e.g. 20% off total bill</p>
            </button>
            <button onClick={() => setOfferType("item_offer")}
              className={`p-4 rounded-xl border-2 text-left transition-all`}
              style={offerType === "item_offer"
                ? { borderColor: "#f97316", background: "rgba(249,115,22,0.1)" }
                : { borderColor: "rgba(255,255,255,0.12)" }}>
              <Tag className="w-5 h-5 text-orange-500 mb-2" />
              <p className="font-semibold text-sm text-white">Item Offers</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Discount on specific items</p>
            </button>
          </div>
        </div>

        {/* Offer Details */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>Offer Details</p>

          {offerType === "flat_percent" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Discount %</label>
                <Input className="mt-1" type="number" min={1} max={100} placeholder="20" value={flatPercent} onChange={e => setFlatPercent(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Min Order (₹)</label>
                <Input className="mt-1" type="number" placeholder="Optional" value={minOrder} onChange={e => setMinOrder(e.target.value)} />
              </div>
            </div>
          )}

          {offerType === "item_offer" && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {menuItems.map(item => (
                <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer`}
                  style={selectedItems[item.id] !== undefined
                    ? { borderColor: "rgba(249,115,22,0.4)", background: "rgba(249,115,22,0.08)" }
                    : { borderColor: "rgba(255,255,255,0.08)" }}
                  onClick={() => toggleItem(item.id)}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${selectedItems[item.id] !== undefined ? "bg-orange-500" : ""}`}
                      style={selectedItems[item.id] === undefined ? { border: "1px solid rgba(255,255,255,0.3)" } : {}}>
                      {selectedItems[item.id] !== undefined && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-white">{item.name}</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{formatINR(item.price)}</span>
                  </div>
                  {selectedItems[item.id] !== undefined && (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <Input type="number" min={1} max={100} value={selectedItems[item.id]}
                        onChange={e => setSelectedItems(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                        className="w-16 h-7 text-xs text-center" />
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>%</span>
                    </div>
                  )}
                </div>
              ))}
              {menuItems.length === 0 && <p className="text-sm text-center py-4" style={{ color: "rgba(255,255,255,0.4)" }}>No menu items found</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Valid Until</label>
              <Input className="mt-1" type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Extra Note</label>
              <Input className="mt-1" placeholder="e.g. Dine-in only" value={customMessage} onChange={e => setCustomMessage(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Customer Selection */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "rgba(255,255,255,0.8)" }}>
              <Users className="w-4 h-4 text-orange-500" /> Recipients
              <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.4)" }}>({customers.length} customers with phone)</span>
            </p>
            <button onClick={() => setSelectAll(!selectAll)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${selectAll ? "bg-orange-500 text-white" : ""}`}
              style={!selectAll ? { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" } : {}}>
              {selectAll ? "All Selected" : "Select All"}
            </button>
          </div>

          {!selectAll && (
            <>
              <Input placeholder="Search customers..." value={searchCustomer} onChange={e => setSearchCustomer(e.target.value)} />
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredCustomers.map(c => (
                  <div key={c.id} onClick={() => setSelectedCustomers(prev => {
                    const next = new Set(prev);
                    next.has(c.id) ? next.delete(c.id) : next.add(c.id);
                    return next;
                  })}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors`}
                    style={selectedCustomers.has(c.id)
                      ? { background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)" }
                      : { border: "1px solid transparent" }}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${selectedCustomers.has(c.id) ? "bg-orange-500" : ""}`}
                      style={!selectedCustomers.has(c.id) ? { border: "1px solid rgba(255,255,255,0.3)" } : {}}>
                      {selectedCustomers.has(c.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-white">{c.name}</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{c.phone}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            {targetCustomers.length} customer{targetCustomers.length !== 1 ? "s" : ""} will receive this promotion
          </p>
        </div>
      </div>

      {/* Right: Preview + Send */}
      <div className="space-y-5">
        {/* Message Preview */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">WhatsApp Preview</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>How the message will look</p>
            </div>
          </div>
          <div className="p-5 min-h-48" style={{ background: "#1a2a1a" }}>
            {previewMsg ? (
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs shadow-sm" style={{ background: "#1e3a1e" }}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>{previewMsg}</p>
                <p className="text-xs mt-2 text-right" style={{ color: "rgba(255,255,255,0.4)" }}>Preview</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Fill in offer details to preview
              </div>
            )}
          </div>
        </div>

        {/* Send Buttons */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="font-semibold text-sm text-white">Send via WhatsApp</p>
          <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }}>
            WhatsApp will open for each customer. Click Send in WhatsApp, then come back for the next one.
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {targetCustomers.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <div>
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{c.phone}</p>
                </div>
                <button
                  onClick={() => openWhatsApp(c)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all`}
                  style={sent.has(c.id)
                    ? { background: "rgba(16,185,129,0.15)", color: "#4ade80" }
                    : { background: "#25D366", color: "#fff" }}>
                  {sent.has(c.id) ? <><Check className="w-3 h-3" /> Sent</> : <><ExternalLink className="w-3 h-3" /> Send</>}
                </button>
              </div>
            ))}
            {targetCustomers.length === 0 && (
              <p className="text-center text-sm py-6" style={{ color: "rgba(255,255,255,0.4)" }}>No customers with phone numbers yet</p>
            )}
          </div>

          {targetCustomers.length > 1 && (
            <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
              {sent.size} of {targetCustomers.length} sent
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
