"use client";
import { useState, useMemo } from "react";
import { ChefHat, Tag, Calendar, Search, Copy, Check, Users, Calculator, AlertCircle, ArrowRight, Clock } from "lucide-react";

type Restaurant = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  logo: string | null;
  currency: string;
  tagline: string | null;
};

type Offer = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  value: number;
  minBillAmount: number;
  maxDiscount: number | null;
  endDate: string;
};

type Variant = {
  id: string;
  name: string;
  price: number;
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  variants: Variant[];
};

type Category = {
  id: string;
  name: string;
  menuItems: MenuItem[];
};

export function DineinClient({
  restaurant,
  offers,
  categories,
}: {
  restaurant: Restaurant;
  offers: Offer[];
  categories: Category[];
}) {
  const [activeTab, setActiveTab] = useState<"menu" | "reserve" | "tools">("menu");

  // Offers clipboard helper
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  function copyToClipboard(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  // Reservation Form State
  const [reserveForm, setReserveForm] = useState({
    guestName: "",
    guestPhone: "",
    guestCount: "2",
    date: "",
    time: "",
    notes: "",
  });
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reserveError, setReserveError] = useState("");

  async function handleReserve(e: React.FormEvent) {
    e.preventDefault();
    if (!reserveForm.guestName || !reserveForm.guestPhone || !reserveForm.date || !reserveForm.time) {
      setReserveError("Please fill in all required fields.");
      return;
    }
    setReserveError("");
    setReserveLoading(true);

    try {
      const dateTimeString = `${reserveForm.date}T${reserveForm.time}`;
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: reserveForm.guestName,
          guestPhone: reserveForm.guestPhone,
          guestCount: Number(reserveForm.guestCount),
          dateTime: dateTimeString,
          notes: reserveForm.notes,
          restaurantId: restaurant.id,
        }),
      });

      if (res.ok) {
        setReserveSuccess(true);
        setReserveForm({
          guestName: "",
          guestPhone: "",
          guestCount: "2",
          date: "",
          time: "",
          notes: "",
        });
      } else {
        const d = await res.json();
        setReserveError(d.error || "Failed to book table. Please try again.");
      }
    } catch (err) {
      setReserveError("Network error. Please try again.");
    } finally {
      setReserveLoading(false);
    }
  }

  // Menu Search
  const [menuSearch, setMenuSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");

  const filteredMenuItems = useMemo(() => {
    if (menuSearch) {
      return categories
        .flatMap(c => c.menuItems)
        .filter(i => i.name.toLowerCase().includes(menuSearch.toLowerCase()));
    }
    return categories.find(c => c.id === activeCategory)?.menuItems || [];
  }, [menuSearch, activeCategory, categories]);

  // Split Bill Calculator
  const [billTotal, setBillTotal] = useState("");
  const [splitCount, setSplitCount] = useState("2");
  const [splitTip, setSplitTip] = useState("0"); // Percentage

  const calculatedSplit = useMemo(() => {
    const total = parseFloat(billTotal);
    const people = parseInt(splitCount);
    const tipPercent = parseFloat(splitTip);
    if (isNaN(total) || total <= 0 || isNaN(people) || people <= 0) return null;

    const tipAmount = (total * (isNaN(tipPercent) ? 0 : tipPercent)) / 100;
    const finalBill = total + tipAmount;
    return {
      perPerson: Math.round(finalBill / people),
      tipTotal: Math.round(tipAmount),
      totalWithTip: Math.round(finalBill),
    };
  }, [billTotal, splitCount, splitTip]);

  function formatINR(n: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      {/* PWA Header banner */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black shadow-md">
              {restaurant.logo ? (
                <img src={restaurant.logo} alt="logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <ChefHat className="w-5 h-5" />
              )}
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-base leading-none">{restaurant.name}</h1>
              <p className="text-xs text-slate-400 mt-1">{restaurant.tagline || "Welcome to our Dine-in portal"}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/50">
            Dine-In Hub
          </span>
        </div>

        {/* Tab switch bar */}
        <div className="flex max-w-md mx-auto border-t border-slate-100">
          {[
            { id: "menu", label: "Menu", icon: ChefHat },
            { id: "reserve", label: "Book Table", icon: Calendar },
            { id: "tools", label: "Split Bill", icon: Calculator },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === t.id
                  ? "border-orange-500 text-orange-600 bg-orange-500/[0.02]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-6">
        {/* Active Offers Section */}
        {offers.length > 0 && activeTab === "menu" && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-orange-500" /> Active Coupons & Offers
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {offers.map(offer => (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl p-4 border border-orange-100 shadow-sm flex-shrink-0 w-72 flex flex-col justify-between"
                  style={{ backgroundImage: "radial-gradient(circle at 100% 50%, rgba(249,115,22,0.02) 0%, transparent 100%)" }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">
                        {offer.discountType === "PERCENTAGE" ? `${offer.value}% OFF` : `${formatINR(offer.value)} OFF`}
                      </span>
                      <button
                        onClick={() => copyToClipboard(offer.code)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                          copiedCode === offer.code
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100"
                        }`}
                      >
                        {copiedCode === offer.code ? (
                          <><Check className="w-3 h-3" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3" /> {offer.code}</>
                        )}
                      </button>
                    </div>
                    <p className="font-extrabold text-slate-800 text-sm mt-2">{offer.title}</p>
                    {offer.description && <p className="text-[11px] text-slate-400 mt-1 leading-normal">{offer.description}</p>}
                  </div>
                  <div className="border-t border-slate-100 pt-2 mt-3 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Min bill: {formatINR(offer.minBillAmount)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Exp: {new Date(offer.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Tab Content */}

        {/* Tab 1: Menu Preview */}
        {activeTab === "menu" && (
          <div className="space-y-4">
            {/* Dine-in order banner alert */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 text-orange-600">
                <ChefHat className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs text-orange-800">Ready to Order?</p>
                <p className="text-[11px] text-orange-700/80 leading-normal mt-0.5">
                  Scan the QR code at your dining table to open the seated cart, queue tracks in the cafe Jukebox, and send orders directly to the kitchen.
                </p>
              </div>
            </div>

            {/* Menu Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                placeholder="Search dishes..."
                value={menuSearch}
                onChange={e => setMenuSearch(e.target.value)}
              />
            </div>

            {/* Categories scroll (only if not searching) */}
            {!menuSearch && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                      activeCategory === cat.id
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Dishes list */}
            <div className="space-y-3">
              {filteredMenuItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 ${item.isVeg ? "border-emerald-500" : "border-red-500"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-emerald-500" : "bg-red-500"}`} />
                      </div>
                      <span className="font-bold text-slate-800 text-sm truncate">{item.name}</span>
                    </div>
                    {item.description && <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>}
                    <div className="font-extrabold text-orange-500 text-sm mt-2">{formatINR(item.price)}</div>
                  </div>

                  {item.variants.length > 0 && (
                    <div className="flex flex-col gap-1 text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-2 flex-shrink-0 text-right">
                      {item.variants.map(v => (
                        <div key={v.id}>
                          {v.name}: <span className="font-semibold text-slate-600">{formatINR(v.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredMenuItems.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No menu items found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Book Table */}
        {activeTab === "reserve" && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
            {reserveSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-500">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Table Requested!</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-normal max-w-xs mx-auto">
                    We have logged your dining request. A confirmation notification will be sent to your phone once confirmed.
                  </p>
                </div>
                <button
                  onClick={() => setReserveSuccess(false)}
                  className="px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
                >
                  Book Another Table
                </button>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="font-bold text-slate-900 text-base">Book a Dining Table</h2>
                  <p className="text-xs text-slate-400 mt-1">Book your spot in advance. No reservation fees.</p>
                </div>

                <form onSubmit={handleReserve} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Your Name *</label>
                      <input
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Rahul"
                        value={reserveForm.guestName}
                        onChange={e => setReserveForm({ ...reserveForm, guestName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Phone Number *</label>
                      <input
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="9876543210"
                        type="tel"
                        value={reserveForm.guestPhone}
                        onChange={e => setReserveForm({ ...reserveForm, guestPhone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Guests *</label>
                      <select
                        className="w-full h-10 rounded-xl border border-slate-200 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        value={reserveForm.guestCount}
                        onChange={e => setReserveForm({ ...reserveForm, guestCount: e.target.value })}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                          <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Date *</label>
                      <input
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                        type="date"
                        value={reserveForm.date}
                        onChange={e => setReserveForm({ ...reserveForm, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Time Slot *</label>
                    <input
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                      type="time"
                      value={reserveForm.time}
                      onChange={e => setReserveForm({ ...reserveForm, time: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Special Notes / Preferences</label>
                    <input
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. Window side, birthday celebration..."
                      value={reserveForm.notes}
                      onChange={e => setReserveForm({ ...reserveForm, notes: e.target.value })}
                    />
                  </div>

                  {reserveError && (
                    <div className="bg-red-50 text-red-600 rounded-xl p-3 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{reserveError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={reserveLoading}
                    className="w-full h-11 rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 4px 16px rgba(249,115,22,0.3)" }}
                  >
                    {reserveLoading ? "Booking Table..." : <>Request Table Booking <ArrowRight className="w-3.5 h-3.5" /></>}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* Tab 3: Split Bill Calculator */}
        {activeTab === "tools" && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-5">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Digital Bill Splitter</h2>
              <p className="text-xs text-slate-400 mt-1">Calculate your individual split values instantly at the dining table.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Total Bill Amount (₹)</label>
                <input
                  type="number"
                  className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. 1500"
                  value={billTotal}
                  onChange={e => setBillTotal(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Number of Friends</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={splitCount}
                    onChange={e => setSplitCount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Tip Percent (%)</label>
                  <select
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    value={splitTip}
                    onChange={e => setSplitTip(e.target.value)}
                  >
                    <option value="0">0% No Tip</option>
                    <option value="5">5% Standard</option>
                    <option value="10">10% Generous</option>
                    <option value="15">15% Exceptional</option>
                  </select>
                </div>
              </div>

              {calculatedSplit ? (
                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 space-y-3 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-orange-600">Per Person Share</span>
                  <div className="text-3xl font-black text-slate-900 leading-none">
                    {formatINR(calculatedSplit.perPerson)}
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between text-xs text-slate-500">
                    <span>Subtotal: {formatINR(parseFloat(billTotal))}</span>
                    <span>Tip: {formatINR(calculatedSplit.tipTotal)}</span>
                    <span>Total: {formatINR(calculatedSplit.totalWithTip)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs flex flex-col items-center gap-2">
                  <Calculator className="w-8 h-8 opacity-25" />
                  <span>Enter bill amount to calculate splits.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
