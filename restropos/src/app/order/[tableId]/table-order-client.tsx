"use client";
import { useEffect, useState, useMemo } from "react";
import { Plus, Minus, ShoppingBag, ChefHat, Search, CheckCircle2, Loader2, X } from "lucide-react";

type Variant = { id: string; name: string; price: number };
type MenuItem = { id: string; name: string; price: number; isVeg: boolean; description: string | null; variants: Variant[] };
type Category = { id: string; name: string; menuItems: MenuItem[] };
type CartItem = { menuItemId: string; variantId?: string; name: string; variantName?: string; price: number; quantity: number };

type PageData = {
  table: { id: string; number: string; section: string | null };
  restaurant: { name: string; address: string | null; logo: string | null };
  categories: Category[];
};

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
}

export function TableOrderClient({ tableId }: { tableId: string }) {
  const [data, setData] = useState<PageData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [step, setStep] = useState<"info" | "menu" | "confirm" | "done">("info");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderNumber: string; total: number } | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);

  // Mini Add-ons States
  const [viewTab, setViewTab] = useState<"menu" | "jukebox" | "waiter">("menu");
  const [songName, setSongName] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [requestedSongs, setRequestedSongs] = useState([
    { id: "s1", name: "Shape of You", artist: "Ed Sheeran", table: "Table T1", time: "5 mins ago" },
    { id: "s2", name: "Blinding Lights", artist: "The Weeknd", table: "Table T4", time: "2 mins ago" },
  ]);
  const [waiterRequest, setWaiterRequest] = useState<string | null>(null);
  const [waiterSuccess, setWaiterSuccess] = useState(false);

  function requestSong(e: React.FormEvent) {
    e.preventDefault();
    if (!songName.trim()) return;
    const newSong = {
      id: Math.random().toString(),
      name: songName,
      artist: songArtist || "Unknown",
      table: `Table ${data?.table.number || "T3"}`,
      time: "Just now",
    };
    setRequestedSongs((prev) => [newSong, ...prev]);
    setSongName("");
    setSongArtist("");
  }

  useEffect(() => {
    fetch(`/api/order/${tableId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setLoadError(d.error); return; }
        setData(d);
        setActiveCategory(d.categories[0]?.id || "");
        if (d.activeOrder) {
          setActiveOrder(d.activeOrder);
          if (d.activeOrder.customerName) {
            setName(d.activeOrder.customerName);
            setStep("menu"); // Skip user info step
          }
        }
      })
      .catch(() => setLoadError("Failed to load menu"));
  }, [tableId]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    if (search) return data.categories.flatMap((c) => c.menuItems).filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    return data.categories.find((c) => c.id === activeCategory)?.menuItems || [];
  }, [data, activeCategory, search]);

  function addToCart(item: MenuItem, variant?: Variant) {
    const key = `${item.id}-${variant?.id || ""}`;
    setCart((prev) => {
      const existing = prev.find((c) => `${c.menuItemId}-${c.variantId || ""}` === key);
      if (existing) return prev.map((c) => `${c.menuItemId}-${c.variantId || ""}` === key ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItemId: item.id, variantId: variant?.id, name: item.name, variantName: variant?.name, price: variant?.price ?? item.price, quantity: 1 }];
    });
  }

  function updateQty(key: string, delta: number) {
    setCart((prev) => {
      const updated = prev.map((c) => `${c.menuItemId}-${c.variantId || ""}` === key ? { ...c, quantity: c.quantity + delta } : c).filter((c) => c.quantity > 0);
      return updated;
    });
  }

  function getQty(item: MenuItem, variant?: Variant) {
    const key = `${item.id}-${variant?.id || ""}`;
    return cart.find((c) => `${c.menuItemId}-${c.variantId || ""}` === key)?.quantity || 0;
  }

  const [couponCode, setCouponCode] = useState("");
  const [appliedOffer, setAppliedOffer] = useState<any>(null);
  const [couponError, setCouponError] = useState("");

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  function applyCoupon(codeStr: string) {
    const code = codeStr.trim().toUpperCase();
    if (!code) {
      setAppliedOffer(null);
      setCouponError("");
      return;
    }
    const offer = (data as any)?.offers?.find((o: any) => o.code === code && o.isActive);
    if (!offer) {
      setCouponError("Invalid coupon code");
      setAppliedOffer(null);
      return;
    }
    if (subtotal < offer.minBillAmount) {
      setCouponError(`Min bill of ${formatINR(offer.minBillAmount)} required`);
      setAppliedOffer(null);
      return;
    }
    setAppliedOffer(offer);
    setCouponError("");
  }

  const discount = useMemo(() => {
    if (!appliedOffer) return 0;
    if (appliedOffer.discountType === "PERCENTAGE") {
      let pctDiscount = Math.round((subtotal * appliedOffer.value) / 100);
      if (appliedOffer.maxDiscount) {
        pctDiscount = Math.min(pctDiscount, appliedOffer.maxDiscount);
      }
      return pctDiscount;
    } else {
      return Math.min(appliedOffer.value, subtotal);
    }
  }, [appliedOffer, subtotal]);

  const tax = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + tax;
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  async function placeOrder() {
    setPlacing(true);
    const res = await fetch(`/api/order/${tableId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: name, customerPhone: phone, items: cart, couponCode: appliedOffer?.code || null }),
    });
    const d = await res.json();
    setPlacing(false);
    if (res.ok) { setOrderResult(d); setStep("done"); }
  }

  // ── Loading ──
  if (!data && !loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <X className="w-7 h-7 text-red-500" />
          </div>
          <p className="font-semibold text-slate-800">Table not found</p>
          <p className="text-slate-400 text-sm mt-1">{loadError}</p>
        </div>
      </div>
    );
  }

  // ── Done ──
  if (step === "done" && orderResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Order Placed!</h2>
          <p className="text-slate-400 text-sm mb-5">Your order has been sent to the kitchen</p>
          <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Order No.</span>
              <span className="font-bold text-slate-800">{orderResult.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Table</span>
              <span className="font-bold text-slate-800">{data!.table.number}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
              <span className="text-slate-500">Total</span>
              <span className="font-bold text-orange-500 text-base">{formatINR(orderResult.total)}</span>
            </div>
          </div>
          <p className="text-slate-400 text-xs">Sit back and relax — your food is being prepared 🍽</p>
        </div>
      </div>
    );
  }

  // ── Customer Info ──
  if (step === "info") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
        <div className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-xl border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{data!.restaurant.name}</p>
              <p className="text-xs text-slate-400">Table {data!.table.number}{data!.table.section ? ` · ${data!.table.section}` : ""}</p>
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-1">Welcome!</h2>
          <p className="text-slate-400 text-sm mb-6">Enter your details to start ordering</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Your Name *</label>
              <input
                className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g. Rahul"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Phone Number</label>
              <input
                className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="+91 98765 43210"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button
              onClick={() => setStep("menu")}
              disabled={!name.trim()}
              className="w-full h-12 rounded-xl text-white font-bold text-base disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 4px 16px rgba(249,115,22,0.35)" }}
            >
              View Menu →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Menu ──
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-20"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{data!.restaurant.name}</p>
              <p className="text-xs text-slate-400">Table {data!.table.number} · Hi, {name}!</p>
            </div>
          </div>
          {totalItems > 0 && viewTab === "menu" && (
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-bold animate-none"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems} · {formatINR(total)}
            </button>
          )}
        </div>

        {/* Tab Sub-navigation */}
        <div className="flex border-t border-slate-100 mt-3 pt-2.5 gap-2">
          {[
            { id: "menu", label: "Order Food" },
            { id: "jukebox", label: "Cafe Jukebox (₹2k)" },
            { id: "waiter", label: "Call Waiter (₹2k)" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewTab(tab.id as any)}
              className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                viewTab === tab.id ? "text-orange-600 bg-orange-50" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search (Only for Menu) */}
      {viewTab === "menu" && (
        <div className="bg-white border-b border-slate-100 px-4 py-2.5 sticky top-[95px] z-10 space-y-2">
          {activeOrder && (
            <div className="bg-orange-50 border border-orange-150 rounded-xl p-3 text-[10px] text-orange-700/80 flex justify-between items-center font-medium animate-none">
              <span>Table order active (Order #{activeOrder.orderNumber}). Items will be appended.</span>
              <span className="font-extrabold text-orange-600">{formatINR(activeOrder.total)}</span>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full h-9 rounded-xl border border-slate-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50"
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Category pills (Only for Menu) */}
      {viewTab === "menu" && !search && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b border-slate-100 sticky top-[145px] z-10">
          {data!.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                activeCategory === cat.id ? "text-white" : "bg-slate-100 text-slate-600"
              }`}
              style={activeCategory === cat.id ? { background: "linear-gradient(135deg, #f97316, #ea580c)" } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Items (Only for Menu) */}
      {viewTab === "menu" && (
        <div className="flex-1 p-4 space-y-3 pb-32">
          {filteredItems.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No items found</p>
            </div>
          )}
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${item.isVeg ? "border-emerald-500" : "border-red-500"}`}>
                      <div className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-emerald-500" : "bg-red-500"}`} />
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                  </div>
                  {item.description && <p className="text-xs text-slate-400 line-clamp-2 mb-2">{item.description}</p>}
                  <p className="font-bold text-orange-500">{formatINR(item.price)}</p>
                </div>

                {/* Add button — no variants */}
                {item.variants.length === 0 && (
                  <div className="flex-shrink-0">
                    {getQty(item) === 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        className="w-9 h-9 rounded-xl text-white flex items-center justify-center cursor-pointer"
                        style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(`${item.id}-`, -1)}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center cursor-pointer">
                          <Minus className="w-3 h-3 text-slate-600" />
                        </button>
                        <span className="w-5 text-center font-bold text-sm">{getQty(item)}</span>
                        <button onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-lg text-white flex items-center justify-center cursor-pointer"
                          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Variants */}
              {item.variants.length > 0 && (
                <div className="mt-3 space-y-2">
                  {item.variants.map((v) => {
                    const qty = getQty(item, v);
                    return (
                      <div key={v.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                        <div>
                          <span className="text-sm font-medium text-slate-700">{v.name}</span>
                          <span className="text-sm text-orange-500 font-bold ml-2">{formatINR(v.price)}</span>
                        </div>
                        {qty === 0 ? (
                          <button onClick={() => addToCart(item, v)}
                            className="w-8 h-8 rounded-lg text-white flex items-center justify-center cursor-pointer"
                            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                            <Plus className="w-3 h-3" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQty(`${item.id}-${v.id}`, -1)}
                              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center cursor-pointer">
                              <Minus className="w-3 h-3 text-slate-600" />
                            </button>
                            <span className="w-4 text-center font-bold text-sm">{qty}</span>
                            <button onClick={() => addToCart(item, v)}
                              className="w-7 h-7 rounded-lg text-white flex items-center justify-center cursor-pointer"
                              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Jukebox Tab (₹2,000 Add-on Demo) */}
      {viewTab === "jukebox" && (
        <div className="flex-1 p-4 space-y-5 pb-32 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Request a Song</h3>
            <p className="text-slate-400 text-[11px] mb-4">Add your favorite song to the cafe's live playback queue (₹2,000 Mini Add-on Demo)</p>
            <form onSubmit={requestSong} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Song Name *</label>
                <input
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50"
                  placeholder="e.g. Starboy"
                  value={songName}
                  onChange={e => setSongName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Artist Name</label>
                <input
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50"
                  placeholder="e.g. The Weeknd"
                  value={songArtist}
                  onChange={e => setSongArtist(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full h-10 rounded-xl text-white font-bold text-xs cursor-pointer"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
              >
                Add to Live Queue
              </button>
            </form>
          </div>

          {/* Currently Playing */}
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest block mb-0.5">Now Playing</span>
              <span className="font-bold text-slate-800 text-sm block">Hotel California</span>
              <span className="text-[11px] text-slate-500">Eagles</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
            </div>
          </div>

          {/* Live Queue */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Upcoming Request Queue ({requestedSongs.length})</h4>
            <div className="space-y-2">
              {requestedSongs.map((song) => (
                <div key={song.id} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 text-xs block">{song.name}</span>
                    <span className="text-[10px] text-slate-400">{song.artist}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full block w-fit ml-auto mb-1">{song.table}</span>
                    <span className="text-[9px] text-slate-400 block">{song.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Call Waiter Tab (₹2,000 Add-on Demo) */}
      {viewTab === "waiter" && (
        <div className="flex-1 p-4 space-y-5 pb-32 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Call Captain / Service Bell</h3>
            <p className="text-slate-400 text-[11px] mb-6">Select a request below to instantly alert the kitchen or captain's terminal (₹2,000 Mini Add-on Demo)</p>
            
            {waiterSuccess && waiterRequest && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl p-3 text-xs mb-5 font-medium animate-in fade-in zoom-in-95 duration-200">
                ✓ Call sent! Captain notified for <strong>"{waiterRequest}"</strong>. A team member is on their way.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Bring Drinking Water", icon: "💧" },
                { label: "Get Billing Invoice", icon: "🧾" },
                { label: "Clean Dining Table", icon: "🧼" },
                { label: "Call Cafe Captain", icon: "🙋‍♂️" }
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => {
                    setWaiterRequest(item.label);
                    setWaiterSuccess(true);
                    setTimeout(() => setWaiterSuccess(false), 4000);
                  }}
                  className="p-4 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/10 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer bg-white"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[11px] font-bold text-slate-700">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticky bottom cart bar */}
      {totalItems > 0 && !cartOpen && viewTab === "menu" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 max-w-2xl mx-auto"
          style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
          <button
            onClick={() => setCartOpen(true)}
            className="w-full h-14 rounded-2xl text-white font-bold text-base flex items-center justify-between px-5 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 4px 16px rgba(249,115,22,0.35)" }}
          >
            <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm">{totalItems} items</span>
            <span>View Order</span>
            <span>{formatINR(total)}</span>
          </button>
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={() => setCartOpen(false)}>
          <div className="bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto max-w-2xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-lg">{activeOrder ? "Add to Order" : "Your Order"}</h3>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Existing Active Order Items */}
            {activeOrder && (
              <div className="mb-4 bg-orange-50/50 border border-orange-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-orange-850 mb-2">Ordered Items (Order #{activeOrder.orderNumber})</p>
                <div className="space-y-1 text-xs text-orange-700/80">
                  {activeOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold">{formatINR(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-orange-200/50 pt-2 mt-2 flex justify-between font-bold text-orange-800">
                    <span>Already Billed:</span>
                    <span>{formatINR(activeOrder.total)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 mb-5">
              {cart.map((item) => {
                const key = `${item.menuItemId}-${item.variantId || ""}`;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                      {item.variantName && <p className="text-xs text-slate-400">{item.variantName}</p>}
                      <p className="text-xs text-orange-500 font-bold">{formatINR(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button onClick={() => updateQty(key, -1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center">
                        <Minus className="w-3 h-3 text-slate-600" />
                      </button>
                      <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(key, 1)}
                        className="w-7 h-7 rounded-lg text-white flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-800 w-16 text-right">{formatINR(item.price * item.quantity)}</p>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Input */}
            <div className="mb-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <label className="text-xs font-bold text-slate-500 block mb-1">Apply Promotion Coupon</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. DISCOUNT20"
                  className="flex-1 h-9 rounded-xl border border-slate-200 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 uppercase bg-white"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                />
                <button
                  type="button"
                  onClick={() => applyCoupon(couponCode)}
                  className="px-4 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[10px] text-red-500 mt-1 font-semibold">{couponError}</p>}
              {appliedOffer && (
                <p className="text-[10px] text-emerald-600 mt-1 font-bold">
                  ✓ Applied! Saved {appliedOffer.discountType === "PERCENTAGE" ? `${appliedOffer.value}%` : formatINR(appliedOffer.value)}
                </p>
              )}
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span><span className="font-medium text-slate-700">{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                  <span>Discount ({appliedOffer?.code})</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-500">
                <span>GST (5%)</span><span className="font-medium text-slate-700">{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-slate-200 pt-2">
                <span>Total</span><span className="text-orange-500">{formatINR(total)}</span>
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={placing}
              className="w-full h-14 rounded-2xl text-white font-bold text-base disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 4px 16px rgba(249,115,22,0.35)" }}
            >
              {placing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> {activeOrder ? "Adding items..." : "Placing order..."}
                </span>
              ) : activeOrder ? (
                "Add to Table Order →"
              ) : (
                "Place Order →"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
