"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ChefHat, Search, MapPin, Tag, Calendar, Calculator, 
  Copy, Check, Star, Sparkles, Receipt, ArrowRight, 
  Heart, Share2, Filter, Percent, Clock, ChevronDown, SlidersHorizontal
} from "lucide-react";

type Restaurant = {
  id: string;
  name: string;
  tagline: string | null;
  address: string | null;
  phone: string | null;
  logo: string | null;
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
  restaurantId: string;
  restaurantName: string;
  endDate: string;
};

// Deterministic helpers to mock rich UI details
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

export function DineoutClient({
  restaurants,
  offers,
}: {
  restaurants: Restaurant[];
  offers: Offer[];
}) {
  const [activeTab, setActiveTab] = useState<"explore" | "offers" | "split">("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPill, setFilterPill] = useState<"all" | "offers" | "distance" | "rating">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Split Bill State
  const [billTotal, setBillTotal] = useState("");
  const [splitCount, setSplitCount] = useState("2");
  const [splitTip, setSplitTip] = useState("0");

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function toggleFavorite(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  }

  // Filter & Sort restaurants
  const filteredRestaurants = useMemo(() => {
    let result = restaurants.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (r.tagline && r.tagline.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.address && r.address.toLowerCase().includes(searchQuery.toLowerCase()));

      const hasOffers = offers.some(o => o.restaurantId === r.id);
      
      if (filterPill === "offers") return matchesSearch && hasOffers;
      return matchesSearch;
    });

    if (filterPill === "rating") {
      result = [...result].sort((a, b) => {
        return parseFloat(getRestoRating(b.name)) - parseFloat(getRestoRating(a.name));
      });
    } else if (filterPill === "distance") {
      result = [...result].sort((a, b) => {
        return parseFloat(getDistance(a.name)) - parseFloat(getDistance(b.name));
      });
    }

    return result;
  }, [restaurants, offers, searchQuery, filterPill]);

  // Split bill calculations
  const splitDetails = useMemo(() => {
    const total = parseFloat(billTotal);
    const count = parseInt(splitCount);
    const tip = parseFloat(splitTip);
    if (isNaN(total) || total <= 0 || isNaN(count) || count <= 0) return null;
    const tipAmt = (total * (isNaN(tip) ? 0 : tip)) / 100;
    const finalBill = total + tipAmt;
    return {
      perPerson: Math.round(finalBill / count),
      tipTotal: Math.round(tipAmt),
      totalWithTip: Math.round(finalBill)
    };
  }, [billTotal, splitCount, splitTip]);

  function formatINR(n: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 font-sans flex flex-col pb-24 selection:bg-orange-500 selection:text-white">
      
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-[#070b12]/90 backdrop-blur-md border-b border-slate-900/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/10">
            <ChefHat className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-500">RestroPOS Portal</span>
              <span className="text-[9px] font-black bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded-full border border-orange-500/20">0% COMM</span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-orange-400 transition-colors mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-bold text-slate-200">Bangalore, Mathikere</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          Direct Booking
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto px-4 mt-4 flex-1 flex flex-col gap-5">
        
        {/* Explore Tab View */}
        {activeTab === "explore" && (
          <div className="flex-1 flex flex-col gap-5">
            
            {/* Promo Header Carousel Title */}
            <div>
              <h2 className="text-xl font-black text-white tracking-tight leading-tight">
                UP TO 50% OFF
              </h2>
              <p className="text-[11px] text-slate-400">Exclusive direct-table pre-booking discounts</p>
            </div>

            {/* Horizontal Featured Carousel */}
            <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-hide">
              {restaurants.slice(0, 4).map(resto => {
                const cover = getRestoCoverImage(resto.id);
                const rating = getRestoRating(resto.name);
                const distance = getDistance(resto.name);
                return (
                  <Link
                    key={`feat-${resto.id}`}
                    href={`/restaurant/${resto.id}`}
                    className="relative w-64 h-36 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-900/80 group shadow-lg"
                  >
                    <img src={cover} alt={resto.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    {/* Discount banner */}
                    <div className="absolute top-2.5 left-2.5 bg-orange-600/90 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
                      <Percent className="w-3 h-3" /> Flat 20% OFF
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-extrabold text-sm leading-tight text-white group-hover:text-orange-400 transition-colors truncate">
                        {resto.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-300">
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-500" /> {rating}
                        </span>
                        <span>•</span>
                        <span>{distance}</span>
                        <span>•</span>
                        <span className="truncate max-w-[100px]">{resto.address || "Mathikere"}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Exclusively on Dineout Banner Card */}
            <div className="rounded-2xl p-4 bg-gradient-to-r from-orange-600 to-rose-600 border border-orange-500/20 shadow-md relative overflow-hidden flex items-center justify-between">
              <div className="space-y-1.5 max-w-[70%] z-10">
                <span className="text-[9px] uppercase font-black tracking-widest bg-white/20 text-white px-2 py-0.5 rounded-full">Exclusively On Dineout</span>
                <h3 className="text-sm font-black text-white leading-tight">0% Commission Structure</h3>
                <p className="text-[10px] text-white/80 leading-normal">
                  No commissions taken from restaurants or guests. You pay directly, they earn fully.
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 backdrop-blur-sm z-10">
                <Percent className="w-8 h-8 font-black" />
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Restaurant Search Bar */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  className="w-full h-11 bg-slate-900 border border-slate-800/80 rounded-xl pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500 shadow-inner"
                  placeholder="Search restaurants, cuisines, or locations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Pills scroll bar */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide items-center">
                <button className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center justify-center text-slate-400 cursor-pointer">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
                {[
                  { id: "all", label: "All Dineout" },
                  { id: "offers", label: "Discount Deals" },
                  { id: "rating", label: "Top Rated" },
                  { id: "distance", label: "Nearest" },
                ].map(pill => (
                  <button
                    key={`pill-${pill.id}`}
                    onClick={() => setFilterPill(pill.id as any)}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold border whitespace-nowrap transition-all cursor-pointer ${
                      filterPill === pill.id
                        ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical Restaurant Cards List */}
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Restaurants near you ({filteredRestaurants.length})
                </h2>
              </div>
              
              <div className="space-y-4">
                {filteredRestaurants.map(resto => {
                  const cover = getRestoCoverImage(resto.id);
                  const rating = getRestoRating(resto.name);
                  const cuisines = getCuisines(resto.name);
                  const cost = getCostForTwo(resto.name);
                  const distance = getDistance(resto.name);
                  const isFav = !!favorites[resto.id];
                  const hasOffers = offers.some(o => o.restaurantId === resto.id);

                  return (
                    <Link
                      key={resto.id}
                      href={`/restaurant/${resto.id}`}
                      className="block bg-slate-900 border border-slate-900/60 hover:border-slate-800 rounded-3xl overflow-hidden transition-all shadow-md group relative"
                    >
                      {/* Photo Header */}
                      <div className="relative w-full h-44 overflow-hidden bg-slate-950">
                        <img src={cover} alt={resto.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        
                        {/* Gradient shade */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                        
                        {/* AD badge */}
                        <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-[8px] font-bold uppercase tracking-wider text-slate-300 px-2 py-0.5 rounded border border-white/5">AD</span>
                        
                        {/* Heart Favorite Trigger */}
                        <button
                          onClick={(e) => toggleFavorite(resto.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? "text-rose-500 fill-rose-500" : "text-white"}`} />
                        </button>

                        {/* Pagination indicator dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        </div>
                      </div>

                      {/* Details Content */}
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-extrabold text-white text-base leading-tight group-hover:text-orange-400 transition-colors">
                              {resto.name}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">{resto.tagline || "Continental · North Indian · Bar Food"}</p>
                          </div>
                          <span className="text-xs font-bold text-white bg-emerald-600 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm shrink-0">
                            {rating} <Star className="w-3.5 h-3.5 fill-white" />
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-0.5">
                          <span>{cuisines}</span>
                          <span>•</span>
                          <span className="font-bold text-slate-200">{cost}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 border-t border-slate-800/60 pt-3">
                          <MapPin className="w-3.5 h-3.5 text-slate-600" />
                          <span>{resto.address || "Mathikere, Bangalore"}</span>
                          <span>•</span>
                          <span className="font-bold text-orange-500">{distance} away</span>
                        </div>

                        {/* Dynamic Tags matching Swiggy Dineout */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <div className="bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-orange-500" /> Table booking
                          </div>
                          <div className="bg-orange-950/20 border border-orange-500/20 text-[10px] text-orange-400 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5 text-orange-500" /> Flat 20% off on pre-booking
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {filteredRestaurants.length === 0 && (
                  <div className="text-center py-16 text-slate-500 text-xs flex flex-col items-center gap-2">
                    <ChefHat className="w-10 h-10 opacity-20" />
                    <span>No restaurants found matching your criteria.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Offers Tab View */}
        {activeTab === "offers" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                <Tag className="w-5 h-5 text-orange-500" /> Direct Discount Vouchers
              </h2>
              <p className="text-xs text-slate-500 mt-1">Copy and apply these coupon codes at checkout on any table QR menu.</p>
            </div>

            <div className="space-y-3">
              {offers.map(offer => (
                <div
                  key={offer.id}
                  className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded-full font-bold text-slate-400 border border-slate-800 block w-fit mb-1">
                        {offer.restaurantName}
                      </span>
                      <h3 className="font-extrabold text-white text-xs">{offer.title}</h3>
                    </div>
                    
                    <button
                      onClick={() => copyCode(offer.code)}
                      className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                        copiedCode === offer.code
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-orange-500/10 text-orange-400 border-orange-500/25 hover:bg-orange-500/20"
                      }`}
                    >
                      {copiedCode === offer.code ? (
                        <><Check className="w-3.5 h-3.5" /> Copied</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> {offer.code}</>
                      )}
                    </button>
                  </div>

                  {offer.description && (
                    <p className="text-[10px] text-slate-400 leading-normal">{offer.description}</p>
                  )}

                  <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center text-[9px] text-slate-500">
                    <span className="text-orange-500 font-bold uppercase tracking-wider">
                      {offer.discountType === "PERCENTAGE" ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
                    </span>
                    <span>Min Order: {formatINR(offer.minBillAmount)}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Exp: {new Date(offer.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}

              {offers.length === 0 && (
                <div className="text-center py-16 text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Tag className="w-10 h-10 opacity-20" />
                  <span>No active promotions available at the moment.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Split Bill Tab View */}
        {activeTab === "split" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5 shadow-lg">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                <Calculator className="w-5 h-5 text-orange-500" /> Digital Bill Splitter
              </h2>
              <p className="text-xs text-slate-500 mt-1">Split food bills and tips instantly while dining at the table.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Total Bill Amount (₹)</label>
                <input
                  type="number"
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-500 text-white"
                  placeholder="e.g. 1500"
                  value={billTotal}
                  onChange={e => setBillTotal(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Number of Friends</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white"
                    value={splitCount}
                    onChange={e => setSplitCount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Tip Percent (%)</label>
                  <select
                    className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white cursor-pointer"
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

              {splitDetails ? (
                <div className="bg-orange-500/[0.02] border border-orange-500/10 rounded-2xl p-5 space-y-3.5 text-center mt-2">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-orange-400">Per Person Share</span>
                  <div className="text-3xl font-black text-white leading-none font-display">
                    {formatINR(splitDetails.perPerson)}
                  </div>
                  <div className="border-t border-slate-800/60 pt-3.5 flex justify-between text-[10px] text-slate-400">
                    <span>Subtotal: {formatINR(parseFloat(billTotal))}</span>
                    <span>Tip: {formatINR(splitDetails.tipTotal)}</span>
                    <span>Total: {formatINR(splitDetails.totalWithTip)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Receipt className="w-8 h-8 opacity-20" />
                  <span>Enter bill details to calculate split results.</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Sticky Bottom PWA Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#070b12]/95 backdrop-blur-md border-t border-slate-900/60 max-w-2xl mx-auto flex items-center justify-around py-3 px-2 shadow-2xl">
        {[
          { id: "explore", label: "Explore", icon: ChefHat },
          { id: "offers", label: "Vouchers", icon: Tag },
          { id: "split", label: "Bill Splitter", icon: Calculator }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex-1 py-1 flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
              activeTab === item.id ? "text-orange-500" : "text-slate-500 hover:text-slate-400"
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-[9px] font-bold tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
