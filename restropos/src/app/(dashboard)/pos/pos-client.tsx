"use client";
import { useState, useMemo } from "react";
import { Search, Plus, Minus, Trash2, Printer, ShoppingBag, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Variant = { id: string; name: string; price: number };
type MenuItem = { id: string; name: string; price: number; isVeg: boolean; variants: Variant[]; categoryId: string };
type Category = { id: string; name: string; menuItems: MenuItem[] };
type Table = { id: string; number: string; status: string; section: string | null };
type CartItem = { menuItemId: string; variantId?: string; name: string; variantName?: string; price: number; quantity: number };

export function POSClient({ categories, tables, restaurantId, userId }: {
  categories: Category[]; tables: Table[]; restaurantId: string; userId: string;
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<"DINE_IN"|"TAKEAWAY"|"DELIVERY">("DINE_IN");
  const [tableId, setTableId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const TAX = 0.05;

  const filteredItems = useMemo(() => {
    if (search) return categories.flatMap(c => c.menuItems).filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return categories.find(c => c.id === activeCategory)?.menuItems || [];
  }, [categories, activeCategory, search]);

  function addToCart(item: MenuItem, variant?: Variant) {
    const key = `${item.id}-${variant?.id||""}`;
    setCart(prev => {
      const ex = prev.find(c => `${c.menuItemId}-${c.variantId||""}` === key);
      if (ex) return prev.map(c => `${c.menuItemId}-${c.variantId||""}` === key ? {...c, quantity: c.quantity+1} : c);
      return [...prev, { menuItemId: item.id, variantId: variant?.id, name: item.name, variantName: variant?.name, price: variant?.price ?? item.price, quantity: 1 }];
    });
  }

  function updateQty(index: number, delta: number) {
    setCart(prev => {
      const u = [...prev];
      u[index].quantity += delta;
      if (u[index].quantity <= 0) u.splice(index, 1);
      return [...u];
    });
  }

  const subtotal = cart.reduce((s,i) => s + i.price * i.quantity, 0);
  const taxAmount = subtotal * TAX;
  const total = subtotal + taxAmount - discount;
  const totalItems = cart.reduce((s,i) => s + i.quantity, 0);

  async function placeOrder() {
    if (!cart.length) return;
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, userId, orderType, tableId: tableId||null, items: cart, discount, paymentMethod, subtotal, taxAmount, total }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setCart([]); setDiscount(0); router.refresh(); }, 1200);
    }
  }

  const paymentMethods = [
    { key: "CASH", label: "Cash",   color: "#10b981" },
    { key: "UPI",  label: "UPI",    color: "#3b82f6" },
    { key: "CARD", label: "Card",   color: "#8b5cf6" },
    { key: "WALLET", label: "Wallet", color: "#f59e0b" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* ── Left: Menu ── */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/[0.06]">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#0a0a0a]">
          {/* Order type */}
          <div className="flex gap-1 bg-white/[0.05] rounded-md p-0.5">
            {(["DINE_IN","TAKEAWAY","DELIVERY"] as const).map(t => (
              <button key={t} onClick={() => setOrderType(t)}
                className={`px-3 py-1.5 rounded text-[12px] font-medium transition-all ${orderType===t ? "bg-orange-500 text-white" : "text-white/40 hover:text-white/70"}`}>
                {t.replace("_"," ")}
              </button>
            ))}
          </div>

          {orderType === "DINE_IN" && (
            <select value={tableId} onChange={e => setTableId(e.target.value)}
              className="h-8 px-2.5 rounded-md bg-white/[0.05] border border-white/10 text-[12px] text-white/70 focus:border-orange-500 focus:outline-none">
              <option value="">Table</option>
              {tables.map(t => <option key={t.id} value={t.id}>{t.number}{t.section ? ` · ${t.section}` : ""}</option>)}
            </select>
          )}

          <div className="flex-1 relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input placeholder="Search menu..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-md bg-white/[0.05] border border-white/10 text-[13px] text-white/80 placeholder:text-white/25 focus:border-orange-500 focus:outline-none" />
          </div>
        </div>

        {/* Category pills */}
        {!search && (
          <div className="flex gap-1.5 px-4 py-2.5 border-b border-white/[0.06] bg-[#0a0a0a] overflow-x-auto">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  activeCategory===cat.id ? "bg-orange-500/15 text-orange-400 border border-orange-500/25" : "text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
                }`}>
                {cat.name}
                <span className={`ml-1.5 text-[10px] ${activeCategory===cat.id ? "text-orange-400/60" : "text-white/20"}`}>{cat.menuItems.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Items grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {filteredItems.map(item => {
              const inCart = cart.find(c => c.menuItemId === item.id);
              return (
                <div key={item.id}
                  className="rounded-lg bg-[#111] border border-white/[0.07] p-3 hover:border-white/15 transition-all cursor-pointer group"
                  onClick={() => item.variants.length === 0 && addToCart(item)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${item.isVeg ? "border-emerald-500" : "border-red-500"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-emerald-500" : "bg-red-500"}`} />
                    </div>
                    {inCart && (
                      <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">×{inCart.quantity}</span>
                    )}
                  </div>
                  <p className="text-[13px] font-medium text-white/80 leading-tight line-clamp-2">{item.name}</p>
                  <p className="text-[12px] font-semibold text-orange-400 mt-1.5 tabular">{formatCurrency(item.price)}</p>

                  {item.variants.length > 0 ? (
                    <div className="mt-2 space-y-1">
                      {item.variants.map(v => (
                        <button key={v.id} onClick={e => { e.stopPropagation(); addToCart(item, v); }}
                          className="w-full text-left text-[11px] bg-white/[0.04] hover:bg-orange-500/10 text-white/50 hover:text-orange-400 px-2 py-1 rounded flex justify-between transition-colors">
                          <span>{v.name}</span><span className="tabular">{formatCurrency(v.price)}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button onClick={e => { e.stopPropagation(); addToCart(item); }}
                      className="mt-2 w-full text-[11px] font-semibold py-1.5 rounded bg-white/[0.04] hover:bg-orange-500/15 text-white/40 hover:text-orange-400 transition-all flex items-center justify-center gap-1">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  )}
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="col-span-full text-center py-16 text-[13px] text-white/20">No items found</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Cart ── */}
      <div className="w-72 flex flex-col bg-[#0a0a0a]">
        {/* Cart header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-white/40" />
            <span className="text-[13px] font-semibold text-white/80">Order</span>
            {totalItems > 0 && (
              <span className="text-[10px] font-bold text-white bg-orange-500 w-4 h-4 rounded-full flex items-center justify-center">{totalItems}</span>
            )}
          </div>
          {tableId && <span className="text-[11px] text-orange-400 font-medium">{tables.find(t=>t.id===tableId)?.number}</span>}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-[12px] text-white/20">Cart is empty</p>
            </div>
          ) : cart.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/[0.03] group">
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-white/75 truncate">{item.name}</p>
                {item.variantName && <p className="text-[10px] text-white/30">{item.variantName}</p>}
                <p className="text-[11px] text-orange-400/80 tabular">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateQty(i,-1)} className="w-5 h-5 rounded bg-white/[0.06] hover:bg-white/10 flex items-center justify-center text-white/50">
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <span className="w-4 text-center text-[12px] font-semibold text-white/80 tabular">{item.quantity}</span>
                <button onClick={() => updateQty(i,1)} className="w-5 h-5 rounded bg-orange-500/20 hover:bg-orange-500/30 flex items-center justify-center text-orange-400">
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
              <p className="text-[12px] font-semibold text-white/70 w-12 text-right tabular">{formatCurrency(item.price*item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* Totals + payment */}
        <div className="px-3 pb-3 pt-2 border-t border-white/[0.06] space-y-3">
          {/* Bill */}
          <div className="bg-white/[0.03] rounded-lg px-3 py-2.5 space-y-1.5">
            <div className="flex justify-between text-[12px] text-white/40">
              <span>Subtotal</span><span className="tabular">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[12px] text-white/40">
              <span>GST 5%</span><span className="tabular">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-[12px] text-white/40">
              <span>Discount</span>
              <input type="number" min={0} value={discount} onChange={e => setDiscount(Number(e.target.value))}
                className="w-16 text-right bg-transparent border-b border-white/10 focus:border-orange-500 focus:outline-none text-white/70 tabular text-[12px]" />
            </div>
            <div className="flex justify-between font-semibold text-[14px] border-t border-white/[0.06] pt-1.5 mt-1">
              <span className="text-white/80">Total</span>
              <span className="text-orange-400 tabular">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="grid grid-cols-4 gap-1">
            {paymentMethods.map(({ key, label, color }) => (
              <button key={key} onClick={() => setPaymentMethod(key)}
                className={`py-2 rounded-md text-[11px] font-semibold transition-all ${paymentMethod===key ? "text-white" : "bg-white/[0.04] text-white/35 hover:text-white/60"}`}
                style={paymentMethod===key ? { background: color + "25", color, border: `1px solid ${color}40` } : {}}>
                {label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => alert("KOT sent!")} disabled={!cart.length}
              className="flex-1 h-9 rounded-md border border-white/10 bg-white/[0.04] text-[12px] font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.07] flex items-center justify-center gap-1.5 disabled:opacity-30 transition-all">
              <Printer className="w-3.5 h-3.5" /> KOT
            </button>
            <button onClick={placeOrder} disabled={!cart.length || loading}
              className="flex-1 h-9 rounded-md text-[13px] font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-30 transition-all"
              style={{ background: success ? "#10b981" : "linear-gradient(135deg, #d97706, #b45309)" }}>
              {success ? "✓ Done" : loading ? "..." : <>Place <ChevronRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>

          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="w-full text-[11px] text-white/20 hover:text-red-400 flex items-center justify-center gap-1 transition-colors">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
