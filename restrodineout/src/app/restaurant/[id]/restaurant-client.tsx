"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ChefHat, Tag, Calendar, Search, Copy, Check, Users, 
  AlertCircle, ArrowLeft, Clock, MapPin, Phone, ArrowRight, 
  Heart, Share2, Star, CheckCircle, Navigation, Percent, Moon, Sun
} from "lucide-react";

type Restaurant = {
  id: string;
  name: string;
  tagline: string | null;
  address: string | null;
  phone: string | null;
  logo: string | null;
  currency: string;
  brandColor: string;
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

// Deterministic helpers matching listings
function getRestoCoverImage(restoId: string) {
  const images = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80"
  ];
  let hash = 0;
  for (let i = 0; i < restoId.length; i++) {
    hash = restoId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % images.length;
  return images[index];
}

function getRestoRating(restoName: string) {
  const ratings = ["4.4", "4.6", "4.7", "4.5", "4.8", "4.3"];
  let hash = 0;
  for (let i = 0; i < restoName.length; i++) {
    hash = restoName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ratings[Math.abs(hash) % ratings.length];
}

function getCuisines(restoName: string) {
  if (restoName.toLowerCase().includes("cafe") || restoName.toLowerCase().includes("coffee")) {
    return "Cafe, Desserts, Beverages";
  }
  if (restoName.toLowerCase().includes("pub") || restoName.toLowerCase().includes("bar") || restoName.toLowerCase().includes("martini")) {
    return "Bar Food, Continental, North Indian";
  }
  if (restoName.toLowerCase().includes("pizza") || restoName.toLowerCase().includes("italian")) {
    return "Pizza, Italian, Fast Food";
  }
  return "North Indian, Chinese, Continental";
}

function getCostForTwo(restoName: string) {
  let hash = 0;
  for (let i = 0; i < restoName.length; i++) {
    hash = restoName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const cost = (Math.abs(hash) % 8) * 150 + 800;
  return `₹${cost} for two`;
}

function getDistance(restoName: string) {
  let hash = 0;
  for (let i = 0; i < restoName.length; i++) {
    hash = restoName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const dist = ((Math.abs(hash) % 40) + 12) / 10;
  return `${dist.toFixed(1)} km`;
}

// Convert 12 hour AM/PM time to 24 hour HH:MM
function convert12hTo24h(time12h: string): string {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  let hrs = parseInt(hours, 10);
  if (modifier === "PM" && hrs < 12) {
    hrs = hrs + 12;
  }
  if (modifier === "AM" && hrs === 12) {
    hrs = 0;
  }
  return `${hrs.toString().padStart(2, "0")}:${minutes}`;
}

export function RestaurantClient({
  restaurant,
  offers,
  categories,
}: {
  restaurant: Restaurant;
  offers: Offer[];
  categories: Category[];
}) {
  const [activeTab, setActiveTab] = useState<"menu" | "reserve">("menu");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Reservation Wizard States
  const [selectedGuestCount, setSelectedGuestCount] = useState<number>(2);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(""); // YYYY-MM-DD
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(""); // "11:45 PM"

  // Reservation Form State (Name & Phone)
  const [reserveForm, setReserveForm] = useState({
    guestName: "",
    guestPhone: "",
    notes: "",
  });
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reserveError, setReserveError] = useState("");

  // Pre-Order Cart States
  const [preOrderEnabled, setPreOrderEnabled] = useState(false);
  const [preOrderCart, setPreOrderCart] = useState<Record<string, { menuItemId: string; variantId?: string; name: string; price: number; quantity: number }>>({});

  // Menu Search
  const [menuSearch, setMenuSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");

  const rating = getRestoRating(restaurant.name);
  const cuisines = getCuisines(restaurant.name);
  const cost = getCostForTwo(restaurant.name);
  const distance = getDistance(restaurant.name);
  const cover = getRestoCoverImage(restaurant.id);

  // Dynamic next 7 days generation
  const next7Days = useMemo(() => {
    const list = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayNum = d.getDate().toString().padStart(2, "0");
      const monthNum = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      const dateStr = `${year}-${monthNum}-${dayNum}`;
      
      let label = weekdays[d.getDay()];
      if (i === 0) label = "Today";
      else if (i === 1) label = "Tomorrow";
      
      list.push({
        label,
        dayNum,
        dateStr
      });
    }
    return list;
  }, []);

  // Initialize date selection on mount
  useMemo(() => {
    if (next7Days.length > 0 && !selectedDateStr) {
      setSelectedDateStr(next7Days[0].dateStr);
    }
  }, [next7Days, selectedDateStr]);

  // Lunch & Dinner slots matching UI
  const lunchSlots = ["12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"];
  const dinnerSlots = ["07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "11:45 PM", "12:00 AM", "12:15 AM"];

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function updatePreOrderQty(key: string, delta: number, menuItemId?: string, variantId?: string, name?: string, price?: number) {
    setPreOrderCart(prev => {
      const existing = prev[key];
      if (existing) {
        const nextQty = existing.quantity + delta;
        if (nextQty <= 0) {
          const clone = { ...prev };
          delete clone[key];
          return clone;
        }
        return { ...prev, [key]: { ...existing, quantity: nextQty } };
      } else if (delta > 0 && menuItemId && name && price !== undefined) {
        return { ...prev, [key]: { menuItemId, variantId, name, price, quantity: 1 } };
      }
      return prev;
    });
  }

  async function handleReserve(e: React.FormEvent) {
    e.preventDefault();
    if (!reserveForm.guestName || !reserveForm.guestPhone || !selectedDateStr || !selectedTimeSlot) {
      setReserveError("Please fill in all required fields (Name, Phone, Date, and Time).");
      return;
    }
    setReserveError("");
    setReserveLoading(true);

    try {
      const time24h = convert12hTo24h(selectedTimeSlot);
      const dateTimeString = `${selectedDateStr}T${time24h}`;
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: reserveForm.guestName,
          guestPhone: reserveForm.guestPhone,
          guestCount: selectedGuestCount,
          dateTime: dateTimeString,
          notes: reserveForm.notes,
          restaurantId: restaurant.id,
          preOrderItems: preOrderEnabled ? Object.values(preOrderCart) : undefined
        }),
      });

      if (res.ok) {
        setReserveSuccess(true);
        setPreOrderEnabled(false);
        setPreOrderCart({});
        setSelectedTimeSlot("");
        setReserveForm({
          guestName: "",
          guestPhone: "",
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

  const filteredMenuItems = useMemo(() => {
    if (menuSearch) {
      return categories
        .flatMap(c => c.menuItems)
        .filter(i => i.name.toLowerCase().includes(menuSearch.toLowerCase()));
    }
    return categories.find(c => c.id === activeCategory)?.menuItems || [];
  }, [menuSearch, activeCategory, categories]);

  function formatINR(n: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 pb-28 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Cover Image & Overlap Card Header */}
      <div className="relative w-full h-64 bg-slate-950">
        <img src={cover} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        {/* Navigation Elements */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <Link href="/" className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-slate-200 hover:text-white border border-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/10 hover:bg-black/60"
            >
              <Heart className={`w-4.5 h-4.5 ${isFavorite ? "text-rose-500 fill-rose-500" : "text-white"}`} />
            </button>
            <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/10 hover:bg-black/60">
              <Share2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Carousel image dots */}
        <div className="absolute bottom-16 right-4 bg-black/50 backdrop-blur-sm text-[10px] font-bold text-slate-300 px-2 py-0.5 rounded-full border border-white/5">
          1 / 6
        </div>
      </div>

      {/* Overlapping Restaurant Profile Card */}
      <div className="max-w-md mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-black text-white leading-tight">{restaurant.name}</h1>
              <p className="text-xs text-slate-400 mt-1">{cuisines}</p>
            </div>
            <div className="text-center shrink-0">
              <span className="text-xs font-black text-white bg-emerald-600 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                {rating} <Star className="w-3.5 h-3.5 fill-white" />
              </span>
              <span className="text-[9px] text-slate-400 mt-1 block">328 ratings</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-800/40 pt-3">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{distance} • {restaurant.address || "Mathikere, Bangalore"}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-slate-200">Open till 12:30 AM</span>
            </div>
            <span className="text-slate-200 font-bold">{cost}</span>
          </div>

          {/* Call & Navigation Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-slate-800/40">
            <a href={`tel:${restaurant.phone || "9740615639"}`} className="flex-1 h-9 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
              <Phone className="w-4 h-4 text-orange-500" /> Call Cafe
            </a>
            <button className="flex-1 h-9 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
              <Navigation className="w-4 h-4 text-orange-500" /> Directions
            </button>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex max-w-md mx-auto border-b border-slate-900 mt-6 bg-[#070b12] sticky top-14 z-30 px-4">
        {[
          { id: "menu", label: "Live Menu", icon: ChefHat },
          { id: "reserve", label: "Book Table", icon: Calendar }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === t.id
                ? "border-orange-500 text-orange-400 bg-orange-500/[0.01]"
                : "border-transparent text-slate-500 hover:text-slate-400"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-md mx-auto px-4 mt-4 space-y-5">
        
        {/* Offers Carousel Tab */}
        {offers.length > 0 && activeTab === "menu" && (
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-orange-500" /> Offers for you
            </h2>
            <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-hide">
              {offers.map(offer => (
                <div
                  key={offer.id}
                  className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex-shrink-0 w-72 flex flex-col justify-between shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/5 to-transparent rounded-bl-3xl" />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-orange-500">
                        {offer.discountType === "PERCENTAGE" ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
                      </span>
                      <button
                        onClick={() => copyCode(offer.code)}
                        className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                          copiedCode === offer.code
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-orange-500/10 text-orange-400 border-orange-500/25 hover:bg-orange-500/20"
                        }`}
                      >
                        {copiedCode === offer.code ? (
                          <><Check className="w-3 h-3" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3" /> {offer.code}</>
                        )}
                      </button>
                    </div>
                    <h3 className="font-extrabold text-white text-xs leading-snug">{offer.title}</h3>
                    {offer.description && <p className="text-[10px] text-slate-400 mt-1 leading-normal">{offer.description}</p>}
                  </div>
                  
                  {/* Bank Cashback mini highlights */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/40 flex items-center justify-between text-[9px] text-slate-500">
                    <span>Direct Seating Offer</span>
                    <span className="font-bold text-emerald-500">0% Commission</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 1: Live Menu List */}
        {activeTab === "menu" && (
          <div className="space-y-4">
            
            {/* Direct Dine-In Alert */}
            <div className="bg-orange-500/[0.02] border border-orange-500/10 rounded-2xl p-4 flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 text-orange-400">
                <ChefHat className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-orange-400">Scan Table QR to Order</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  To place order at the restaurant, scan the table QR code. Zero billing commission. You can apply the coupons copied above.
                </p>
              </div>
            </div>

            {/* Menu Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500"
                placeholder="Search dishes..."
                value={menuSearch}
                onChange={e => setMenuSearch(e.target.value)}
              />
            </div>

            {/* Categories scroll pills */}
            {!menuSearch && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-bold border whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                      activeCategory === cat.id
                        ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10"
                        : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Dishes list */}
            <div className="space-y-3.5">
              {filteredMenuItems.map(item => (
                <div key={item.id} className="bg-slate-900 border border-slate-900/60 rounded-2xl p-4 shadow-sm flex justify-between gap-3 group">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${item.isVeg ? "border-emerald-500" : "border-red-500"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-emerald-500" : "bg-red-500"}`} />
                      </div>
                      <span className="font-extrabold text-white text-xs group-hover:text-orange-400 transition-colors truncate">{item.name}</span>
                    </div>
                    {item.description && <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>}
                    <div className="font-black text-orange-400 text-xs mt-2">{formatINR(item.price)}</div>
                  </div>

                  {item.variants.length > 0 && (
                    <div className="flex flex-col gap-1 text-[9px] text-slate-400 bg-slate-950 border border-slate-850 rounded-lg p-2 flex-shrink-0 text-right h-fit select-none">
                      {item.variants.map(v => (
                        <div key={v.id}>
                          {v.name}: <span className="font-semibold text-slate-300">{formatINR(v.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredMenuItems.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No menu items found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Book Table (Wizard Redesigned to Match Swiggy Dineout) */}
        {activeTab === "reserve" && (
          <div className="space-y-5">
            {reserveSuccess ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base font-display">Table Requested Successfully!</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-normal max-w-xs mx-auto">
                    A table reservation has been directly registered in {restaurant.name}'s database. Live order seating updates are synched.
                  </p>
                </div>
                <button
                  onClick={() => setReserveSuccess(false)}
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Book Another Table
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5 shadow-lg">
                <div>
                  <h2 className="font-black text-white text-base font-display">Book table</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">{restaurant.name}</p>
                </div>

                {/* Banner alert */}
                <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Get flat 0% commission direct billing on booking</span>
                </div>

                <form onSubmit={handleReserve} className="space-y-5">
                  
                  {/* Number of Guests Slider */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Number of guest(s)</label>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <button
                          key={`guest-${n}`}
                          type="button"
                          onClick={() => setSelectedGuestCount(n)}
                          className={`w-11 h-10 rounded-xl font-bold text-xs border shrink-0 transition-all cursor-pointer ${
                            selectedGuestCount === n
                              ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10 scale-105"
                              : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visit Date Horizontal Picker */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">When are you visiting?</label>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {next7Days.map(day => {
                        const isSelected = selectedDateStr === day.dateStr;
                        return (
                          <button
                            key={day.dateStr}
                            type="button"
                            onClick={() => setSelectedDateStr(day.dateStr)}
                            className={`w-18 h-18 rounded-2xl border flex flex-col items-center justify-center gap-1 shrink-0 transition-all cursor-pointer ${
                              isSelected
                                ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/15 scale-105"
                                : "bg-slate-950 border-slate-850 text-slate-400"
                            }`}
                          >
                            <span className="text-[9px] uppercase font-semibold opacity-80">{day.label}</span>
                            <span className="text-base font-black leading-none">{day.dayNum}</span>
                            <span className={`text-[8px] font-bold tracking-tight px-1 py-0.2 rounded ${isSelected ? "bg-white/20 text-white" : "bg-emerald-950/20 text-emerald-400"}`}>
                              0% COMM
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time slots picker grouped by Dinner / Lunch */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Select a slot time</label>
                    
                    {/* Dinner slots */}
                    <div className="space-y-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/40">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Moon className="w-3.5 h-3.5 text-orange-500" /> Dinner Slots
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {dinnerSlots.map(time => {
                          const isSelected = selectedTimeSlot === time;
                          return (
                            <button
                              key={`time-dinner-${time}`}
                              type="button"
                              onClick={() => setSelectedTimeSlot(time)}
                              className={`py-2 rounded-xl text-[10px] font-bold border transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                                isSelected
                                  ? "bg-orange-500 border-orange-500 text-white shadow-md"
                                  : "bg-slate-950 border-slate-850 text-slate-300"
                              }`}
                            >
                              <span>{time.replace(" PM", "").replace(" AM", "")}</span>
                              <span className="text-[7px] font-extrabold uppercase mt-0.5 opacity-80">{time.includes("PM") ? "PM" : "AM"}</span>
                              <span className={`text-[7px] mt-0.5 font-bold ${isSelected ? "text-white" : "text-emerald-500"}`}>0% COMM</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Lunch slots */}
                    <div className="space-y-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/40">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Sun className="w-3.5 h-3.5 text-amber-500" /> Lunch Slots
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {lunchSlots.map(time => {
                          const isSelected = selectedTimeSlot === time;
                          return (
                            <button
                              key={`time-lunch-${time}`}
                              type="button"
                              onClick={() => setSelectedTimeSlot(time)}
                              className={`py-2 rounded-xl text-[10px] font-bold border transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                                isSelected
                                  ? "bg-orange-500 border-orange-500 text-white shadow-md"
                                  : "bg-slate-950 border-slate-850 text-slate-300"
                              }`}
                            >
                              <span>{time.replace(" PM", "")}</span>
                              <span className="text-[7px] font-extrabold uppercase mt-0.5 opacity-80">PM</span>
                              <span className={`text-[7px] mt-0.5 font-bold ${isSelected ? "text-white" : "text-emerald-500"}`}>0% COMM</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Booking option detail checkbox block */}
                  {selectedTimeSlot && (
                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2 animate-fadeIn">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Booking option for {selectedTimeSlot}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4.5 h-4.5 text-orange-500" />
                          <div>
                            <p className="text-xs font-bold text-white">0% Platform commission</p>
                            <p className="text-[9px] text-slate-400">Keep 100% of value. Pay direct to merchant via UPI.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Customer Information (Name & Phone) */}
                  <div className="space-y-3.5 pt-2 border-t border-slate-800/40">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diner Details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Your Name *</label>
                        <input
                          className="w-full h-10 bg-slate-950 border border-slate-850 rounded-xl px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white"
                          placeholder="e.g. Rahul"
                          value={reserveForm.guestName}
                          onChange={e => setReserveForm({ ...reserveForm, guestName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Phone Number *</label>
                        <input
                          className="w-full h-10 bg-slate-950 border border-slate-850 rounded-xl px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white"
                          placeholder="e.g. 9876543210"
                          type="tel"
                          value={reserveForm.guestPhone}
                          onChange={e => setReserveForm({ ...reserveForm, guestPhone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Special Preferences</label>
                      <input
                        className="w-full h-10 bg-slate-950 border border-slate-850 rounded-xl px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white"
                        placeholder="e.g. window seat, quiet table..."
                        value={reserveForm.notes}
                        onChange={e => setReserveForm({ ...reserveForm, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Pre-Order Toggle */}
                  <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Order Ahead (Pre-Order)?</p>
                      <p className="text-[9px] text-slate-400">Kitchen will serve food within 5 mins of your arrival</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preOrderEnabled}
                      onChange={e => setPreOrderEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 accent-orange-500 cursor-pointer"
                    />
                  </div>

                  {/* Pre-Order Items List */}
                  {preOrderEnabled && (
                    <div className="border border-slate-800 rounded-2xl p-3.5 bg-slate-950/50 space-y-3.5 max-h-60 overflow-y-auto shadow-inner">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select pre-order dishes</p>
                      <div className="space-y-3.5 divide-y divide-slate-850">
                        {categories.flatMap(c => c.menuItems).flatMap(item => {
                          if (item.variants.length > 0) {
                            return item.variants.map(v => ({
                              id: `${item.id}-${v.id}`,
                              itemId: item.id,
                              variantId: v.id as string | undefined,
                              name: `${item.name} (${v.name})`,
                              price: v.price
                            }));
                          }
                          return [{
                            id: item.id,
                            itemId: item.id,
                            variantId: undefined as string | undefined,
                            name: item.name,
                            price: item.price
                          }];
                        }).map((dish, idx) => {
                          const key = dish.id;
                          const quantity = preOrderCart[key]?.quantity || 0;
                          return (
                            <div key={key} className={`flex items-center justify-between text-xs ${idx > 0 ? "pt-3.5" : ""}`}>
                              <div>
                                <p className="font-semibold text-white">{dish.name}</p>
                                <p className="text-[10px] text-orange-400 font-bold">{formatINR(dish.price)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {quantity > 0 && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => updatePreOrderQty(key, -1)}
                                      className="w-6.5 h-6.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 flex items-center justify-center font-black cursor-pointer border border-slate-800"
                                    >
                                      -
                                    </button>
                                    <span className="w-4 text-center font-bold text-white text-xs">{quantity}</span>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => updatePreOrderQty(key, 1, dish.itemId, dish.variantId, dish.name, dish.price)}
                                  className="w-6.5 h-6.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-black cursor-pointer border border-orange-500"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {reserveError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                      <span>{reserveError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={reserveLoading}
                    className="w-full h-11 rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 4px 16px rgba(249,115,22,0.25)" }}
                  >
                    {reserveLoading ? "Booking..." : <>Confirm Table Booking <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions matching Swiggy Dineout detail bar */}
      {activeTab === "menu" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#070b12]/95 backdrop-blur-md border-t border-slate-900/60 p-4 max-w-2xl mx-auto flex gap-3 shadow-2xl">
          <button
            onClick={() => setActiveTab("reserve")}
            className="flex-1 h-11 rounded-xl border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 flex items-center justify-center text-xs font-bold text-orange-400 transition-colors"
          >
            Book table for Free
          </button>
          <button
            onClick={() => setActiveTab("reserve")}
            className="flex-1 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-xs font-bold text-white transition-colors"
            style={{ boxShadow: "0 4px 14px rgba(249,115,22,0.2)" }}
          >
            Pay bill &amp; Get Offer
          </button>
        </div>
      )}
    </div>
  );
}
