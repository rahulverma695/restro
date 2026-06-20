"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
// removed next-auth import
import { useRouter } from "next/navigation";
import {
  ChefHat, ArrowRight, Check, Zap, BarChart3, Table2, Package,
  Printer, ShieldCheck, Star, Smartphone, Megaphone, Users,
  Code2, Wrench, MessageSquare, QrCode, Sparkles, TrendingUp,
  Wifi, WifiOff, RefreshCw, ShoppingCart, Cloud, Tablet, Laptop,
  Download, Music, Bell, Car, Lightbulb, Gift, Key,
  Hotel, Dumbbell, Scissors, Calendar, ShoppingBag, Terminal, Database, Server
} from "lucide-react";

const PRODUCT_CATALOG = {
  restropos: {
    id: "restropos",
    name: "RestroPOS",
    tagline: "Custom billing & table QR system for restaurants and cafes.",
    basePrice: 14999,
    baseDesc: "Includes 3-click cashier counter, floor table layout, universal thermal printer routing, CRM loyalty, offline server synchronization, and GST reporting.",
    icon: ChefHat,
    premiumFeatures: [
      { id: "employee", name: "Employee Attendance & Shifts", desc: "Designation details, shift configurations, check-in log sheets, and leave requests.", icon: Users },
      { id: "custom_software", name: "Bespoke HRMS & Custom Software", desc: "Custom employee portals, payroll engines, shift check-ins, or other operations tools built for your specific workflow.", icon: Code2 },
      { id: "inventory", name: "Inventory & Stock Depletion", desc: "Real-time stock alerts, menu item recipe linked depletion, and low stock reports.", icon: Package },
      { id: "online_hub", name: "Online Order Hub Integration", desc: "Push delivery counter packets from Swiggy, Zomato, and direct websites into one register.", icon: Smartphone },
      { id: "sms_marketing", name: "SMS Marketing & Promo Campaigns", desc: "Run promotional discount notifications targeting regular customer phone databases on checkout.", icon: Megaphone },
      { id: "ai_brand", name: "AI Brand Builder & Poster Studio", desc: "Enter discounts or campaign parameters to auto-render gorgeous marketing images in seconds.", icon: Sparkles },
      { id: "lan_sync", name: "Multi-Terminal LAN Sync", desc: "Sync billing databases across bar printers, captain terminals, and front cashier counters without internet.", icon: Wifi }
    ],
    miniAddons: [
      { id: "jukebox", name: "Cafe Jukebox Queue", desc: "Customers add songs to a live queue via QR ordering page.", icon: Music },
      { id: "waiter", name: "Call Waiter / Bell", desc: "One-click dining table QR alerts captain terminals or chef screens.", icon: Bell },
      { id: "valet", name: "Valet Parking Callback", desc: "Scan receipt QR from table to request valet vehicle dispatch.", icon: Car },
      { id: "energy", name: "Smart Energy Monitor", desc: "AC/lighting scheduling linked to live POS occupancy traffic.", icon: Lightbulb },
      { id: "spin_wheel", name: "Gamified Spin-the-Wheel", desc: "Increase loyal re-visits with checkout gamified discounts.", icon: Gift },
      { id: "wifi_gen", name: "Wi-Fi Passcode Generator", desc: "Print time-limited unique passwords directly on guest receipts.", icon: Key },
      { id: "whatsapp_feed", name: "Instant WhatsApp Feedback", desc: "Negative review alerts pushed directly to manager mobiles.", icon: MessageSquare }
    ]
  }
};;

export default function LandingPage() {
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoLogin = () => {
    setDemoLoading(true);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    window.location.href = `${appUrl}/login?demo=true`;
  };

  // Dynamic Product selection & Configurator states
  const [selectedProduct, setSelectedProduct] = useState<"restropos">("restropos");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedMiniAddons, setSelectedMiniAddons] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: "",
    restaurantName: "", // Maps to Business/Outlet Name in UI
    email: "",
    phone: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Visual Showcase states (RestroPOS flags)
  const [activeTab, setActiveTab] = useState<"qr" | "billing" | "sync">("qr");

  // Interactive POS Simulator States
  const [sales, setSales] = useState(12450);
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([]);
  const [simTable, setSimTable] = useState("T3");
  const [simOrders, setSimOrders] = useState([
    { id: "ORD-9204", table: "Table T5", items: "1x Butter Chicken, 2x Naan", total: 440, status: "Preparing" as "Preparing" | "Ready" | "Served" },
    { id: "ORD-9203", table: "Table T2", items: "1x Garlic Paneer, 1x Soda", total: 340, status: "Ready" as "Preparing" | "Ready" | "Served" }
  ]);
  const [simAlerts, setSimAlerts] = useState<Array<{ id: string; time: string; msg: string }>>([
    { id: "a1", time: "16:45:01", msg: "🛎️ System booted. Counter printer online." }
  ]);

  // Billing Counter Floor Tables Simulation State
  const [tables, setTables] = useState([
    { id: "T1", status: "Available", bill: 0 },
    { id: "T2", status: "Occupied", bill: 640 },
    { id: "T3", status: "Occupied", bill: 1200 },
    { id: "T4", status: "Billing", bill: 450 },
    { id: "T5", status: "Available", bill: 0 },
    { id: "T6", status: "Occupied", bill: 820 }
  ]);
  const [selectedBillingTable, setSelectedBillingTable] = useState("T3");

  // Offline LAN Sync Simulation State
  const [isOffline, setIsOffline] = useState(false);

  // Cart Actions
  const handleAddToCart = (item: { id: string; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== itemId);
    });
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;
    const itemsText = cart.map(i => `${i.quantity}x ${i.name}`).join(", ");
    const orderId = "ORD-" + Math.floor(9205 + Math.random() * 800);
    
    const newOrder = {
      id: orderId,
      table: `Table ${simTable}`,
      items: itemsText,
      total,
      status: "Preparing" as const
    };
    
    setSimOrders(prev => [newOrder, ...prev]);
    setSales(prev => prev + total);
    setCart([]);
    
    const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
    if (isOffline) {
      setSimAlerts(prev => [
        { id: Math.random().toString(), time, msg: `🔌 [Offline Cache] Saved ${orderId} locally on Table ${simTable}` },
        { id: Math.random().toString(), time, msg: `⚠️ LAN Sync: Unsynced local order stored in SQLite cache` },
        ...prev
      ].slice(0, 5));
    } else {
      setSimAlerts(prev => [
        { id: Math.random().toString(), time, msg: `🛎️ Table ${simTable} placed order: ${itemsText} (Total: ₹${total})` },
        { id: Math.random().toString(), time, msg: `☁️ Neon Cloud DB: Syncing transaction ${orderId} -> Postgres...` },
        ...prev
      ].slice(0, 5));
    }

    setTimeout(() => {
      setSimOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Ready" } : o));
      const alertTime = new Date().toLocaleTimeString("en-IN", { hour12: false });
      setSimAlerts(prev => [{ id: Math.random().toString(), time: alertTime, msg: `🍳 Kitchen: Order ${orderId} for Table ${simTable} is READY.` }, ...prev].slice(0, 5));
    }, 4000);

    setTimeout(() => {
      setSimOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Served" } : o));
      const alertTime = new Date().toLocaleTimeString("en-IN", { hour12: false });
      setSimAlerts(prev => [{ id: Math.random().toString(), time: alertTime, msg: `🤵 Served: Order ${orderId} delivered to Table ${simTable}.` }, ...prev].slice(0, 5));
    }, 8000);
  };

  const handleTriggerAlert = (type: "waiter" | "music" | "valet") => {
    const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
    let msg = "";
    if (type === "waiter") msg = `🛎️ Table ${simTable} requested captain service.`;
    if (type === "music") msg = `🎵 Table ${simTable} added "Butter by BTS" to Jukebox.`;
    if (type === "valet") msg = `🚗 Table ${simTable} requested valet parking callback.`;
    setSimAlerts(prev => [{ id: Math.random().toString(), time, msg }, ...prev].slice(0, 5));
  };

  const basePrice = PRODUCT_CATALOG[selectedProduct].basePrice;
  const featurePrice = 0;
  const miniAddonPrice = 0;
  const totalPrice = 14999;

  const selectAndScroll = (productId: "restropos") => {
    setSelectedProduct(productId);
    setTimeout(() => {
      const element = document.getElementById("software-builder");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  const toggleFeature = (name: string) => {
    setSelectedFeatures(prev =>
      prev.includes(name)
        ? prev.filter(f => f !== name)
        : [...prev, name]
    );
  };

  const toggleMiniAddon = (name: string) => {
    setSelectedMiniAddons(prev =>
      prev.includes(name)
        ? prev.filter(f => f !== name)
        : [...prev, name]
    );
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.restaurantName || !leadForm.email || !leadForm.phone) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadForm,
          product: selectedProduct,
          features: [...selectedFeatures, ...selectedMiniAddons],
          totalPrice
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSubmitSuccess(true);
        setLeadId(data.leadId);
      } else {
        setErrorMsg(data.error || "Failed to submit. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    document.title = "RestroPOS | Flat-Rate Restaurant Billing & Table QR System";
    const activeTheme = localStorage.getItem("restropos-theme") || "theme-cabernet";
    const classes = Array.from(document.documentElement.classList);
    classes.forEach(c => {
      if (c.startsWith("theme-")) {
        document.documentElement.classList.remove(c);
      }
    });
    document.documentElement.classList.add(activeTheme);
  }, []);

  return (
    <div style={{ background: "#ffffff", fontFamily: "var(--font-inter), var(--font-outfit), sans-serif", color: "#2E251F" }}>
      
      {/* ── Nav Bar ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "var(--text-dark)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChefHat style={{ width: 16, height: 16, color: "#fff" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: "#2E251F", letterSpacing: "0.2px", display: "flex", alignItems: "baseline", gap: 6 }}>
              RestroPOS
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>by Anvil Labs</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={handleDemoLogin} disabled={demoLoading} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--orange)", padding: "8px 16px", outline: "none", opacity: demoLoading ? 0.6 : 1 }}>
              {demoLoading ? "Loading..." : "Launch Live Demo"}
            </button>
            <Link href="#software-builder" style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "var(--orange)", padding: "9px 20px", borderRadius: 30, textDecoration: "none", transition: "opacity 0.2s" }} onMouseOver={e => e.currentTarget.style.opacity = "0.9"} onMouseOut={e => e.currentTarget.style.opacity = "1"}>Configure POS →</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{ padding: "80px 24px 72px", textAlign: "center", position: "relative", overflow: "hidden", background: "linear-gradient(180deg, var(--color-orange-50) 0%, #ffffff 75%)" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse at 50% 0%, var(--orange-dim) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--color-orange-100)", border: "1px solid var(--border)", borderRadius: 99, padding: "6px 16px", fontSize: 13, fontWeight: 700, color: "var(--orange)", marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--orange)", display: "inline-block" }} />
            The Flat-Rate POS Suite · Custom builds ready in 24h
          </div>
          <h1 style={{ fontSize: "clamp(34px, 5.5vw, 60px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px", color: "#2E251F", marginBottom: 20 }}>
            Get a custom-built POS suite for your restaurant.<br />
            <span style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>For a single flat ₹14,999/year.</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 750, margin: "0 auto 12px" }}>
            Get a premium billing counter, dynamic table QR ordering, inventory tracking, and chef kitchen screens tailored to your cafe or restaurant. All for a single flat rate.
          </p>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 36, opacity: 0.85 }}>
            We handle deployment, 24/7 technical support, and automated daily backups on your private Postgres database.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
            <Link href="#software-builder" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--orange)", color: "#fff", fontWeight: 700, fontSize: 16, padding: "14px 32px", borderRadius: 30, textDecoration: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.06), 0 2px 4px var(--orange-dim)" }}>
              Configure Your POS <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link href="/deck" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-dark)", fontWeight: 600, fontSize: 15, padding: "14px 28px", borderRadius: 30, textDecoration: "none", border: "1.5px solid var(--border)", background: "#fff" }}>
              View Presentation Deck
            </Link>
          </div>

          {/* ── Interactive Product Preview Showcase ── */}
          <div style={{ maxWidth: 1000, margin: "0 auto", borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(46, 37, 31, 0.12), 0 8px 16px rgba(0,0,0,0.03)", background: "#ffffff" }}>
            
            {/* Simulator Browser Top Bar */}
            <div style={{ background: "#F5F2EE", padding: "12px 18px", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ef4444", opacity: 0.7 }} />
                  <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#f59e0b", opacity: 0.7 }} />
                  <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#10b981", opacity: 0.7 }} />
                </div>
                <div style={{ background: "rgba(0,0,0,0.04)", borderRadius: 6, padding: "4px 16px", fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", display: "inline-block" }}>
                  restropos.com/simulator
                </div>
              </div>

              {/* Interaction Tabs */}
              <div style={{ display: "flex", background: "rgba(0,0,0,0.04)", padding: 3, borderRadius: 20 }}>
                {[
                  { id: "qr", label: "1. Table QR Ordering", icon: QrCode },
                  { id: "billing", label: "2. Cashier POS", icon: Tablet },
                  { id: "sync", label: "3. Offline Sync", icon: Wifi }
                ].map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: 18,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: active ? "#ffffff" : "transparent",
                        color: active ? "var(--orange)" : "var(--text-muted)",
                        boxShadow: active ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                        transition: "all 0.2s"
                      }}
                    >
                      <Icon style={{ width: 13, height: 13 }} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Showcase Split Grid */}
            <div style={{ background: "#FCFAF6", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", borderBottom: "1px solid var(--border)" }}>
              
              {/* Product UI Mockup Column */}
              <div style={{ minHeight: 420, display: "flex", flexDirection: "column", justifyContent: "stretch", borderRight: "1px solid var(--border)" }}>
                
                {/* 1. TABLE QR ORDERING TAB (Left column: diner self-order app mockup) */}
                {activeTab === "qr" && (
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "left", flexGrow: 1 }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 12 }}>
                        <div>
                          <span style={{ fontSize: 9, fontWeight: 800, color: "var(--orange)", textTransform: "uppercase" }}>Diner QR self-ordering mockup</span>
                          <h4 style={{ fontSize: 13, fontWeight: 800, color: "#2E251F", margin: "2px 0 0" }}>self_order.app · Table {simTable}</h4>
                        </div>
                        <select 
                          value={simTable} 
                          onChange={e => setSimTable(e.target.value)} 
                          style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, border: "1px solid var(--border)", background: "#fff", fontWeight: 700, color: "#2E251F", outline: "none" }}
                        >
                          <option value="T3">Table T3</option>
                          <option value="T1">Table T1</option>
                          <option value="T5">Table T5</option>
                        </select>
                      </div>

                      {/* Menu Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                        {[
                          { id: "m1", name: "Paneer Tikka Roll", price: 180 },
                          { id: "m2", name: "Butter Chicken", price: 320 },
                          { id: "m3", name: "Garlic Naan", price: 60 },
                          { id: "m4", name: "Fresh Lime Soda", price: 90 }
                        ].map(item => (
                          <div key={item.id} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between", height: 72 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#2E251F", lineHeight: 1.2 }}>{item.name}</span>
                              <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--orange)" }}>₹{item.price}</span>
                            </div>
                            <button 
                              onClick={() => handleAddToCart(item)}
                              style={{ border: "none", background: "var(--color-orange-100)", color: "var(--orange)", fontSize: 10, fontWeight: 800, borderRadius: 4, padding: "2.5px 8px", cursor: "pointer", alignSelf: "flex-end" }}
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cart Section */}
                    <div style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      {cart.length === 0 ? (
                        <div style={{ textAlign: "center", fontSize: 10.5, color: "var(--text-muted)", fontStyle: "italic", padding: "12px 0" }}>
                          🛒 Cart is empty. Click "+ Add" on items above.
                        </div>
                      ) : (
                        <>
                          <div style={{ maxHeight: 90, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                            {cart.map(item => (
                              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10.5, borderBottom: "1px solid rgba(0,0,0,0.03)", paddingBottom: 4 }}>
                                <span style={{ fontWeight: 600, color: "#2E251F" }}>{item.name}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <button 
                                    onClick={() => handleRemoveFromCart(item.id)}
                                    style={{ width: 16, height: 16, border: "none", background: "#f1f5f9", fontSize: 10, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                  >
                                    −
                                  </button>
                                  <span style={{ fontWeight: 700, color: "#2E251F" }}>{item.quantity}</span>
                                  <button 
                                    onClick={() => handleAddToCart({ id: item.id, name: item.name, price: item.price })}
                                    style={{ width: 16, height: 16, border: "none", background: "#f1f5f9", fontSize: 10, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                  >
                                    +
                                  </button>
                                  <span style={{ fontWeight: 700, color: "#2E251F", marginLeft: 4 }}>₹{item.price * item.quantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 8, fontSize: 11, fontWeight: 800, color: "#2E251F" }}>
                            <span>Total (inc. 5% GST):</span>
                            <span>₹{Math.round(cart.reduce((s, i) => s + i.price * i.quantity, 0) * 1.05)}</span>
                          </div>
                          <button 
                            onClick={handlePlaceOrder}
                            style={{ width: "100%", border: "none", background: "var(--orange)", color: "#fff", padding: "8px", borderRadius: 20, fontWeight: 700, fontSize: 11.5, cursor: "pointer", transition: "opacity 0.2s" }}
                            onMouseOver={e => e.currentTarget.style.opacity = "0.9"}
                            onMouseOut={e => e.currentTarget.style.opacity = "1"}
                          >
                            Place Order (Self-Checkout KOT)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. CASHIER POS TAB (Left column: Floor seating layouts) */}
                {activeTab === "billing" && (
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "left", flexGrow: 1 }}>
                    <div>
                      <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 16 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: "var(--orange)", textTransform: "uppercase" }}>Restaurant Seating Plan</span>
                        <h4 style={{ fontSize: 13, fontWeight: 800, color: "#2E251F", margin: "2px 0 0" }}>Live Floor Layout Simulator</h4>
                      </div>

                      {/* Floor seating tables grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                        {tables.map(table => {
                          const isSelected = selectedBillingTable === table.id;
                          return (
                            <div 
                              key={table.id}
                              onClick={() => setSelectedBillingTable(table.id)}
                              style={{
                                padding: "10px",
                                borderRadius: 8,
                                border: isSelected ? "2px solid var(--orange)" : "1px solid var(--border)",
                                background: "#ffffff",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                height: 80,
                                boxShadow: isSelected ? "0 4px 12px var(--orange-dim)" : "none",
                                transition: "all 0.2s"
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: 800, fontSize: 12, color: "#2E251F" }}>{table.id}</span>
                                <span style={{ 
                                  fontSize: 8, 
                                  fontWeight: 800, 
                                  padding: "1px 4px", 
                                  borderRadius: 4,
                                  background: table.status === "Available" ? "rgba(22,163,74,0.12)" : table.status === "Occupied" ? "rgba(239,68,68,0.12)" : "rgba(59,130,246,0.12)",
                                  color: table.status === "Available" ? "#16a34a" : table.status === "Occupied" ? "#ef4444" : "#3b82f6"
                                }}>
                                  {table.status.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div style={{ fontSize: 8, color: "var(--text-muted)", textTransform: "uppercase" }}>Bill</div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: "#2E251F", fontFamily: "monospace" }}>
                                  {table.bill > 0 ? `₹${table.bill.toLocaleString()}` : "—"}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ fontSize: 10, color: "var(--text-muted)", background: "rgba(0,0,0,0.03)", padding: 8, borderRadius: 6, textAlign: "center" }}>
                      💡 Click on a table above to manage its order &amp; billing status in the right-side cashier panel.
                    </div>
                  </div>
                )}

                {/* 3. OFFLINE SYNC TAB (Left column: Wifi switch & local sync nodes) */}
                {activeTab === "sync" && (
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "left", flexGrow: 1 }}>
                    <div>
                      <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 16 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: "var(--orange)", textTransform: "uppercase" }}>Offline Sync Engine</span>
                        <h4 style={{ fontSize: 13, fontWeight: 800, color: "#2E251F", margin: "2px 0 0" }}>Local SQLite Failover Panel</h4>
                      </div>

                      {/* Connection status card */}
                      <div style={{ 
                        background: isOffline ? "rgba(239,68,68,0.06)" : "rgba(22,163,74,0.06)",
                        border: isOffline ? "1.5px solid rgba(239,68,68,0.2)" : "1.5px solid rgba(22,163,74,0.2)",
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}>
                        <div>
                          <div style={{ fontSize: 8.5, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Network Sync Status</div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: isOffline ? "#ef4444" : "#16a34a", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: isOffline ? "#ef4444" : "#16a34a", display: "inline-block" }} />
                            {isOffline ? "OFFLINE (LAN Sync Active)" : "ONLINE (Cloud Connected)"}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setIsOffline(prev => {
                              const next = !prev;
                              const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
                              if (next) {
                                setSimAlerts(prevLogs => [
                                  { id: Math.random().toString(), time, msg: `🔌 INTERNET CUT OUT. Offline serverless sync active...` },
                                  { id: Math.random().toString(), time, msg: `💾 Sync Engine: Local database routing orders to SQLite cache` },
                                  ...prevLogs
                                ].slice(0, 5));
                              } else {
                                setSimAlerts(prevLogs => [
                                  { id: Math.random().toString(), time, msg: `📶 Wifi Restored: Connecting to Neon serverless cluster...` },
                                  { id: Math.random().toString(), time, msg: `⚡ Syncing local cached transactions to Neon PostgreSQL...` },
                                  { id: Math.random().toString(), time, msg: `✓ Cloud databases synchronized successfully.` },
                                  ...prevLogs
                                ].slice(0, 5));
                              }
                              return next;
                            });
                          }}
                          style={{
                            border: "none",
                            background: isOffline ? "#16a34a" : "#ef4444",
                            color: "#fff",
                            fontSize: 10.5,
                            fontWeight: 800,
                            borderRadius: 20,
                            padding: "6px 12px",
                            cursor: "pointer",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                          }}
                        >
                          {isOffline ? "Restore Wifi Sync" : "Simulate Wifi Cut"}
                        </button>
                      </div>

                      {/* Active nodes */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ fontSize: 8.5, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>LAN sync terminal nodes (Active):</span>
                        {[
                          { name: "Node-1 Counter Cashier POS", storage: isOffline ? "SQLite cache local" : "Neon PG Cloud" },
                          { name: "Node-2 Chef Kitchen KOT Screen", storage: "LAN sync loop" },
                          { name: "Node-3 Dining Table QR PWA", storage: isOffline ? "LAN local server" : "Cloud PWA routing" }
                        ].map((node, idx) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#fff", border: "1px solid var(--border)", borderRadius: 6, fontSize: 10.5 }}>
                            <span style={{ fontWeight: 600, color: "#2E251F" }}>{node.name}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--orange)", fontFamily: "monospace" }}>{node.storage}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                )}

              </div>

              {/* Cashier Monitor Column (Right Column) */}
              <div style={{ background: "#181412", padding: "20px", minHeight: 420, display: "flex", flexDirection: "column", justifyContent: "stretch", textAlign: "left" }}>
                
                {/* Right Column content for Tab 1 (Table QR Ordering) */}
                {activeTab === "qr" && (
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", width: "100%", flexGrow: 1 }}>
                    <div>
                      {/* Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 8, marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Printer style={{ width: 14, height: 14, color: "#4ade80" }} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#a8a29e", fontFamily: "monospace" }}>Cashier Counter POS</span>
                        </div>
                        <span style={{ fontSize: 9, color: "#4ade80", fontFamily: "monospace", fontWeight: 700 }}>🟢 PRINTER ONLINE</span>
                      </div>

                      {/* KPI Stats Row */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "6px 10px" }}>
                          <div style={{ fontSize: 8.5, color: "#78716c", fontWeight: 700 }}>TODAY'S SALES</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80", fontFamily: "monospace" }}>₹{sales.toLocaleString()}</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "6px 10px" }}>
                          <div style={{ fontSize: 8.5, color: "#78716c", fontWeight: 700 }}>ACTIVE KOTs</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8", fontFamily: "monospace" }}>{simOrders.length} orders</div>
                        </div>
                      </div>

                      {/* Active KOT Queue */}
                      <div style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto", marginBottom: 12 }}>
                        {simOrders.length === 0 ? (
                          <div style={{ color: "#78716c", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>No active KOTs</div>
                        ) : (
                          simOrders.map(o => (
                            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 6 }}>
                              <div style={{ minWidth: 0, flexGrow: 1, marginRight: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontWeight: 700, color: "#e7e5e4" }}>{o.id}</span>
                                  <span style={{ fontSize: 9, color: "#a8a29e", fontFamily: "monospace" }}>{o.table}</span>
                                </div>
                                <div style={{ fontSize: 9.5, color: "#78716c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.items}</div>
                              </div>
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#e7e5e4" }}>₹{o.total}</div>
                                <span style={{ 
                                  fontSize: 8, 
                                  fontWeight: 800, 
                                  background: o.status === "Preparing" ? "rgba(249,115,22,0.12)" : o.status === "Ready" ? "rgba(22,163,74,0.12)" : "rgba(255,255,255,0.06)", 
                                  color: o.status === "Preparing" ? "#f97316" : o.status === "Ready" ? "#16a34a" : "#78716c", 
                                  padding: "1px 4px", 
                                  borderRadius: 4 
                                }}>
                                  {o.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Real-time signals */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, marginTop: "auto" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: "#a8a29e" }}>🛎️ SIMULATE QR SIGNALS:</span>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => handleTriggerAlert("waiter")} style={{ border: "none", background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontSize: 8.5, fontWeight: 800, padding: "2px 6px", borderRadius: 4, cursor: "pointer" }}>🛎️ Call Waiter</button>
                          <button onClick={() => handleTriggerAlert("music")} style={{ border: "none", background: "rgba(56,189,248,0.15)", color: "#38bdf8", fontSize: 8.5, fontWeight: 800, padding: "2px 6px", borderRadius: 4, cursor: "pointer" }}>🎵 Jukebox</button>
                          <button onClick={() => handleTriggerAlert("valet")} style={{ border: "none", background: "rgba(167,139,250,0.15)", color: "#a78bfa", fontSize: 8.5, fontWeight: 800, padding: "2px 6px", borderRadius: 4, cursor: "pointer" }}>🚗 Valet</button>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 42, overflowY: "auto", fontFamily: "monospace", fontSize: 8.5, color: "#78716c" }}>
                        {simAlerts.map(a => (
                          <div key={a.id} style={{ display: "flex", gap: 4 }}>
                            <span style={{ color: "rgba(255,255,255,0.15)" }}>[{a.time}]</span>
                            <span style={{ color: "#a8a29e", textAlign: "left" }}>{a.msg}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Column content for Tab 2 (Cashier POS floor layout manager) */}
                {activeTab === "billing" && (
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", width: "100%", flexGrow: 1 }}>
                    {(() => {
                      const activeTableData = tables.find(t => t.id === selectedBillingTable) || tables[0];
                      return (
                        <>
                          <div>
                            {/* Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 8, marginBottom: 16 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Tablet style={{ width: 14, height: 14, color: "var(--orange)" }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#a8a29e", fontFamily: "monospace" }}>Billing Desk Terminal</span>
                              </div>
                              <span style={{ fontSize: 9, color: "var(--orange)", fontFamily: "monospace", fontWeight: 700 }}>TABLE {selectedBillingTable} MANAGER</span>
                            </div>

                            {/* Table Status Details */}
                            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <div>
                                  <span style={{ fontSize: 8.5, color: "#78716c", fontWeight: 700 }}>SELECTED DEVICE</span>
                                  <div style={{ fontSize: 14, fontWeight: 800, color: "#e7e5e4" }}>{selectedBillingTable} Register</div>
                                </div>
                                <span style={{ 
                                  fontSize: 8.5, 
                                  fontWeight: 800, 
                                  padding: "2px 6px", 
                                  borderRadius: 4,
                                  background: activeTableData.status === "Available" ? "rgba(22,163,74,0.12)" : activeTableData.status === "Occupied" ? "rgba(239,68,68,0.12)" : "rgba(59,130,246,0.12)",
                                  color: activeTableData.status === "Available" ? "#16a34a" : activeTableData.status === "Occupied" ? "#ef4444" : "#3b82f6"
                                }}>
                                  {activeTableData.status.toUpperCase()}
                                </span>
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
                                <div>
                                  <span style={{ fontSize: 8.5, color: "#78716c", fontWeight: 700 }}>UNPAID CHARGES</span>
                                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--orange)", fontFamily: "monospace", marginTop: 2 }}>
                                    ₹{activeTableData.bill.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <span style={{ fontSize: 8.5, color: "#78716c", fontWeight: 700 }}>TAX (5% GST)</span>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: "#a8a29e", fontFamily: "monospace", marginTop: 2 }}>
                                    ₹{Math.round(activeTableData.bill * 0.05).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Settlement Actions */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              <button
                                onClick={() => {
                                  setTables(prev => prev.map(t => {
                                    if (t.id === selectedBillingTable) {
                                      return {
                                        ...t,
                                        status: t.status === "Available" ? "Occupied" : t.status,
                                        bill: t.bill + 180
                                      };
                                    }
                                    return t;
                                  }));
                                  const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
                                  setSimAlerts(prev => [{ id: Math.random().toString(), time, msg: `➕ POS Counter: Added Butter Chicken to ${selectedBillingTable} (+₹180)` }, ...prev].slice(0, 5));
                                }}
                                style={{
                                  width: "100%",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  background: "rgba(255,255,255,0.02)",
                                  color: "#e7e5e4",
                                  padding: "9px",
                                  borderRadius: 8,
                                  fontWeight: 700,
                                  fontSize: 11,
                                  cursor: "pointer",
                                  transition: "all 0.2s"
                                }}
                              >
                                ➕ Add Butter Chicken (Simulate Order +₹180)
                              </button>

                              <button
                                onClick={() => {
                                  setTables(prev => prev.map(t => {
                                    if (t.id === selectedBillingTable && t.status === "Occupied") {
                                      return { ...t, status: "Billing" };
                                    }
                                    return t;
                                  }));
                                  const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
                                  setSimAlerts(prev => [{ id: Math.random().toString(), time, msg: `🖨️ Thermal Sync: Printed invoice receipt for ${selectedBillingTable} (₹${activeTableData.bill})` }, ...prev].slice(0, 5));
                                }}
                                disabled={activeTableData.status !== "Occupied"}
                                style={{
                                  width: "100%",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  background: "rgba(255,255,255,0.02)",
                                  color: activeTableData.status === "Occupied" ? "#38bdf8" : "#78716c",
                                  padding: "9px",
                                  borderRadius: 8,
                                  fontWeight: 700,
                                  fontSize: 11,
                                  cursor: activeTableData.status === "Occupied" ? "pointer" : "not-allowed",
                                  transition: "all 0.2s",
                                  opacity: activeTableData.status === "Occupied" ? 1 : 0.4
                                }}
                              >
                                🖨️ Print Receipt Invoice
                              </button>

                              <button
                                onClick={() => {
                                  if (activeTableData.bill === 0) return;
                                  setSales(prev => prev + activeTableData.bill);
                                  setTables(prev => prev.map(t => {
                                    if (t.id === selectedBillingTable) {
                                      return { ...t, status: "Available", bill: 0 };
                                    }
                                    return t;
                                  }));
                                  const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
                                  setSimAlerts(prev => [{ id: Math.random().toString(), time, msg: `💰 POS Desk: Table ${selectedBillingTable} settled cash payment of ₹${activeTableData.bill}` }, ...prev].slice(0, 5));
                                }}
                                disabled={activeTableData.bill === 0}
                                style={{
                                  width: "100%",
                                  border: "none",
                                  background: activeTableData.bill > 0 ? "var(--orange)" : "#2e251f",
                                  color: "#fff",
                                  padding: "10px",
                                  borderRadius: 8,
                                  fontWeight: 700,
                                  fontSize: 11,
                                  cursor: activeTableData.bill > 0 ? "pointer" : "not-allowed",
                                  transition: "opacity 0.2s"
                                }}
                              >
                                💸 Settle Bill &amp; Free Table (Checkout)
                              </button>
                            </div>
                          </div>

                          {/* Console pings */}
                          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, marginTop: "auto" }}>
                            <span style={{ fontSize: 8.5, fontWeight: 800, color: "#78716c", textTransform: "uppercase" }}>System Signals Stream:</span>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 42, overflowY: "auto", fontFamily: "monospace", fontSize: 8.5, color: "#78716c", marginTop: 4 }}>
                              {simAlerts.map(a => (
                                <div key={a.id} style={{ display: "flex", gap: 4 }}>
                                  <span style={{ color: "rgba(255,255,255,0.15)" }}>[{a.time}]</span>
                                  <span style={{ color: "#a8a29e", textAlign: "left" }}>{a.msg}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Right Column content for Tab 3 (Offline Sync logs screen) */}
                {activeTab === "sync" && (
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", width: "100%", flexGrow: 1 }}>
                    <div>
                      {/* Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 8, marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Server style={{ width: 14, height: 14, color: isOffline ? "#ef4444" : "#4ade80" }} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#a8a29e", fontFamily: "monospace" }}>LAN Sync Manager</span>
                        </div>
                        <span style={{ fontSize: 9, color: isOffline ? "#ef4444" : "#4ade80", fontFamily: "monospace", fontWeight: 700 }}>
                          {isOffline ? "🔴 LOCAL ONLY" : "🟢 NEON SYNCED"}
                        </span>
                      </div>

                      {/* Info logs */}
                      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, padding: 12, marginBottom: 16 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div>
                            <span style={{ fontSize: 8, color: "#78716c", fontWeight: 700, textTransform: "uppercase" }}>Local Cache Size</span>
                            <div style={{ fontSize: 12, fontWeight: 800, color: "#e7e5e4", fontFamily: "monospace", marginTop: 2 }}>14.24 KB</div>
                          </div>
                          <div>
                            <span style={{ fontSize: 8, color: "#78716c", fontWeight: 700, textTransform: "uppercase" }}>Unsynced Transactions</span>
                            <div style={{ fontSize: 12, fontWeight: 800, color: isOffline ? "#ef4444" : "#4ade80", fontFamily: "monospace", marginTop: 2 }}>
                              {isOffline ? "1 order pending" : "0 records"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <span style={{ fontSize: 8.5, fontWeight: 800, color: "#78716c", textTransform: "uppercase" }}>Sync Engine Transaction Log:</span>
                      
                      {/* Log Console screen */}
                      <div style={{ 
                        background: "rgba(0,0,0,0.3)", 
                        border: "1px solid rgba(255,255,255,0.06)", 
                        borderRadius: 8, 
                        padding: 10, 
                        height: 180, 
                        overflowY: "auto",
                        fontFamily: "monospace", 
                        fontSize: 9, 
                        color: "#a8a29e", 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: 5,
                        marginTop: 6
                      }}>
                        {isOffline ? (
                          <>
                            <div style={{ color: "#ef4444", fontWeight: 700 }}>[WARN] Neon cloud connection lost (socket reset).</div>
                            <div style={{ color: "#f59e0b" }}>[INFO] local sync: Spawning SQLite edge database server...</div>
                            <div>[INFO] local sync: Terminals bonded on LAN network node cluster.</div>
                            <div>[INFO] local sync: Table QR routing in-house menu via LAN node.</div>
                            <div style={{ color: "#4ade80" }}>✓ system ready. local transactions logged to SQLite.</div>
                          </>
                        ) : (
                          <>
                            <div style={{ color: "#4ade80" }}>[INFO] sync: Neon Serverless Database connected.</div>
                            <div>[INFO] sync: Ping database endpoint at 24ms.</div>
                            <div>[INFO] sync: Pushing edge KOT schemas -{">"} Neon...</div>
                            <div style={{ color: "#4ade80" }}>✓ database synced. schemas congruent.</div>
                            <div>[INFO] sync: Owner Dashboard reports active.</div>
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, marginTop: "auto" }}>
                      <span style={{ fontSize: 8, color: "#78716c", textTransform: "uppercase" }}>Engine logs:</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 42, overflowY: "auto", fontFamily: "monospace", fontSize: 8.5, color: "#78716c", marginTop: 4 }}>
                        {simAlerts.map(a => (
                          <div key={a.id} style={{ display: "flex", gap: 4 }}>
                            <span style={{ color: "rgba(255,255,255,0.15)" }}>[{a.time}]</span>
                            <span style={{ color: "#a8a29e", textAlign: "left" }}>{a.msg}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section style={{ padding: "88px 24px", background: "#ffffff", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--orange)", textTransform: "uppercase", letterSpacing: "1.5px" }}>How it Works</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "#2E251F", letterSpacing: "-0.5px", marginTop: 8, marginBottom: 12 }}>Flat-rate subscription. All features included.</h2>
            <p style={{ fontSize: 17, color: "var(--text-muted)", maxWidth: 650, margin: "0 auto" }}>
              We configure, deploy, and manage your premium POS suite for one low yearly price. Complete managed hosting, automated backups, and 24/7 technical support included.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {[
              { step: "01", title: "Choose Your Modules", desc: "Select the RestroPOS base package and choose the exact features, custom widgets, or restaurant integrations your operation requires." },
              { step: "02", title: "Managed Deployment", desc: "We configure the database and cloud server infrastructure, handling the technical setup in less than 24 hours." },
              { step: "03", title: "Menu Import & Launch", desc: "We help you import your food and drink menu, table layouts, and customer database directly, preparing your systems for immediate launch." },
              { step: "04", title: "Annual Subscription", desc: "A single flat ₹14,999/year package includes managed cloud hosting, automatic backups, ongoing updates, and direct support." }
            ].map(col => (
              <div key={col.step} style={{ background: "#FCFAF6", border: "1.5px solid var(--border)", padding: "28px 24px", borderRadius: 16, position: "relative" }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: "var(--orange-dim)", fontFamily: "monospace", lineHeight: 1, marginBottom: 14 }}>{col.step}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2E251F", marginBottom: 10 }}>{col.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>{col.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Data Sovereignty Section ── */}
      <section style={{ padding: "88px 24px", background: "#FCFAF6", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--orange)", textTransform: "uppercase", letterSpacing: "1.5px" }}>Security &amp; Independence</span>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "#2E251F", letterSpacing: "-0.5px", lineHeight: 1.2, marginTop: 8, marginBottom: 18 }}>
                Own Your Data.<br />No lock-in databases.
              </h2>
              <p style={{ fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 0 }}>
                Unlike other platforms that charge extra for every single user, terminal, or feature, RestroPOS provides the complete package for one predictable annual fee.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { title: "No Third-Party Access", desc: "Your databases sit on dedicated serverless database instances, fully encrypted. We never scan your transaction history or client phone numbers." },
                { title: "Managed Peace of Mind", desc: "Our managed cloud infrastructure keeps your app fast, secure, and always-on with zero technical overhead or server stress for you." },
                { title: "No Vendor Lock-In", desc: "Easily export your complete transaction history, customer databases, and menu structures in standard JSON/CSV formats anytime." }
              ].map((item, idx) => (
                <div key={idx} style={{ background: "#ffffff", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: "#2E251F", margin: "0 0 4px" }}>{item.title}</h4>
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Technology Stack & Architecture ── */}
      <section style={{ padding: "88px 24px", background: "#ffffff", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48, alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--orange)", textTransform: "uppercase", letterSpacing: "1.5px" }}>The Tech Stack</span>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "#2E251F", letterSpacing: "-0.5px", lineHeight: 1.2, marginTop: 8, marginBottom: 18 }}>
                Modern Open-Source Stack.<br />Managed Enterprise Cloud.
              </h2>
              <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                We build on modern open-source frameworks. Every restaurant instance is hosted on isolated cloud infrastructure, optimizing load speeds and ensuring database security.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                {[
                  { icon: Terminal, title: "Next.js", desc: "React Framework" },
                  { icon: Database, title: "PostgreSQL", desc: "Dedicated Database" },
                  { icon: Server, title: "Enterprise Cloud", desc: "Fully Managed Hosting" }
                ].map((t, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center", background: "#FCFAF6", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 14px", flexGrow: 1 }}>
                    <t.icon style={{ width: 18, height: 18, color: "var(--orange)" }} />
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: "#2E251F" }}>{t.title}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { title: "Edge Serverless Routing", desc: "Next.js pages render at edge networks, keeping page speed load times under 200ms globally." },
                { title: "Managed PostgreSQL DB", desc: "Your database is fully hosted and managed by us with daily auto-backups and zero maintenance hassle." },
                { title: "TypeScript & Prisma ORM", desc: "Type-safe database relations and clean codebase schemas, making future updates simple to roll out." },
                { title: "Offline Local Sync Backup", desc: "SQLite synchronization scripts run inside local counter devices, keeping registers active if Wi-Fi cuts." }
              ].map((f, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "#FCFAF6", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ width: 24, height: 24, background: "var(--color-orange-100)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <Check style={{ width: 14, height: 14, color: "var(--orange)" }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 800, color: "#2E251F", margin: "0 0 4px" }}>{f.title}</h4>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.45 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Dedicated Maintenance Upkeep ── */}
      <section style={{ padding: "80px 24px", background: "linear-gradient(135deg, var(--color-orange-50) 0%, #ffffff 100%)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--color-orange-100)", border: "1px solid var(--border)", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 800, color: "var(--orange)", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 20 }}>
              <ChefHat style={{ width: 12, height: 12 }} /> Dedicated Maintenance Plan
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "#2E251F", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 18 }}>
              Managed Support & Upkeep.<br />Included.
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
              Other SaaS players charge thousands of rupees just to keep support ticketing open. RestroPOS acts as your permanent technical support and maintenance team, fully covered by your flat-rate subscription.
            </p>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
              What this covers: custom domain mapping, SSL certificate renewal, automated daily cloud database backups, database security upgrades, and direct engineering support.
            </p>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
              <Wrench style={{ width: 18, height: 18, color: "var(--orange)", flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>
                <strong style={{ color: "#2E251F" }}>Direct WhatsApp Support:</strong> Direct integration queries and code tweaks connect you straight to our core development engineers via chat.
              </p>
            </div>
          </div>
          
          <div style={{ display: "grid", gap: 8 }}>
            {[
              "SSL setups & HTTPS security configurations",
              "Automated daily cloud database backups",
              "Bespoke layout updates & operational settings",
              "Custom WhatsApp API transaction configs",
              "Linking turnstiles, printers, and external scanners",
              "Configuring custom client CRM dashboards",
              "Adding new staff registers and login roles",
              "Ongoing security upgrades and package checks"
            ].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px" }}>
                <div style={{ width: 20, height: 20, background: "var(--color-orange-100)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check style={{ width: 12, height: 12, color: "var(--orange)" }} />
                </div>
                <span style={{ fontSize: 14, color: "#2E251F" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section style={{ padding: "88px 24px", background: "#FCFAF6", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "#2E251F", letterSpacing: "-0.5px", marginBottom: 10 }}>Compare the Math</h2>
            <p style={{ fontSize: 16, color: "var(--text-muted)" }}>Compare the long-term value of our flat-rate package.</p>
          </div>

          <div style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid var(--border)", boxShadow: "0 4px 20px rgba(46, 37, 31, 0.03)", display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr" }}>
            <div style={{ display: "contents", fontSize: 12, fontWeight: 800, color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <div style={{ padding: "14px 20px", background: "#FCFAF6", borderBottom: "1.5px solid var(--border)" }}>Comparison Metric</div>
              <div style={{ padding: "14px 20px", background: "#FCFAF6", borderLeft: "1.5px solid var(--border)", borderRight: "1.5px solid var(--border)", borderBottom: "1.5px solid var(--border)", textAlign: "center" }}>Standard B2B SaaS POS</div>
              <div style={{ padding: "14px 20px", background: "var(--color-orange-100)", borderBottom: "1.5px solid var(--border)", color: "var(--orange)", textAlign: "center" }}>RestroPOS (Flat Rate)</div>
            </div>
              
              {[
                ["Pricing Model", "Base + Add-ons Per Terminal", "Flat ₹14,999 / year"],
                ["Hosting Infrastructure", "Additional monthly cloud bills", "Included in subscription (₹0 server stress)"],
                ["Features & Add-ons", "₹2,000 - ₹5,000 per module extra", "All 13+ add-ons included (₹0 extra)"],
                ["Database Isolation", "Shared database (risk of cross-tenant exposure)", "Isolated dedicated database instance"],
                ["Hidden Commissions", "Commission cuts (0.5% - 2% on bills)", "Never (0% commission)"],
                ["Custom layouts/features", "❌ Never supported", "✓ Built to order & fully configured"],
                ["Continuous Support & Updates", "Expensive retainer contracts", "Fully included in subscription"],
                ["3-Year Total Outlay", "₹1,50,000+ (Rented with limits)", "₹44,997 (All-Inclusive)"]
              ].map(([feature, them, us], i) => (
                <div key={`row-${i}`} style={{ display: "contents" }}>
                  <div style={{ padding: "14px 20px", fontSize: 13.5, fontWeight: i === 7 ? 800 : 500, color: "#2E251F", borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>{feature}</div>
                  <div style={{ padding: "14px 20px", fontSize: 13.5, color: "var(--text-muted)", borderBottom: "1px solid var(--border)", textAlign: "center", background: i % 2 === 0 ? "#fff" : "#fafafa", borderLeft: "1.5px solid var(--border)", borderRight: "1.5px solid var(--border)" }}>{them}</div>
                  <div style={{ padding: "14px 20px", fontSize: 13.5, fontWeight: 700, color: "var(--orange)", borderBottom: "1px solid var(--border)", textAlign: "center", background: "var(--color-orange-50)" }}>{us}</div>
                </div>
              ))}
          </div>

        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: "80px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "#2E251F", textAlign: "center", letterSpacing: "-0.5px", marginBottom: 48 }}>What business owners say</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {[
              { name: "Arjun Mehta", role: "Owner, Spice Garden Cafe", text: "We migrated our restaurant from typical SaaS platforms. Same advanced POS features, zero monthly subscription stress. The flat-rate all-inclusive package has saved us over ₹30,000 in Year 1 alone." },
              { name: "Rohan Patel", role: "Founder, Mumbai Masala & Chai Hub", text: "Running a multi-device setup with cashier counter billing, table QR ordering, and kitchen display printers usually costs a fortune in monthly fees. RestroPOS gives us everything in one flat rate." },
              { name: "Priya Sharma", role: "Owner, The Biryani House", text: "The offline sync mini-server is a lifesaver. Even when our internet drops, billing and table orders keep running. RestroPOS is the only POS system that puts the owner first." }
            ].map(({ name, role, text }) => (
              <div key={name} style={{ background: "#FCFAF6", border: "1.5px solid var(--border)", borderRadius: 16, padding: "28px" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} style={{ width: 14, height: 14, color: "var(--orange)", fill: "var(--orange)" }} />
                  ))}
                </div>
                <p style={{ fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 18, fontStyle: "italic" }}>&ldquo;{text}&rdquo;</p>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#2E251F", margin: "0 0 2px" }}>{name}</p>
                  <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bespoke Software Extension ── */}
      <section style={{ padding: "80px 24px", background: "var(--accent-dim)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "1.5px" }}>Bespoke Development</span>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "#2E251F", letterSpacing: "-0.5px", marginTop: 8, marginBottom: 16 }}>
            Need an HRMS, Custom Payroll, or Custom CRM?
          </h2>
          <p style={{ fontSize: 16.5, color: "var(--text-muted)", maxWidth: 750, margin: "0 auto 20px", lineHeight: 1.6 }}>
            We aren't just limited to restaurant billing. If your business operations require custom features like employee HRMS platforms, shift check-ins, custom salary calculations, advanced inventory alerts, or integration with external legacy APIs—our engineering team builds it for you.
          </p>
          <p style={{ fontSize: 14.5, fontWeight: 700, color: "var(--accent)", margin: 0 }}>
            Every custom button, report, or operations module is built directly into your flat subscription rate!
          </p>
        </div>
      </section>

      {/* ── Software Configurator ── */}
      <section id="software-builder" style={{ padding: "88px 24px", background: "#FCFAF6", borderTop: "1px solid var(--border)", scrollMarginTop: 64 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--orange)", textTransform: "uppercase", letterSpacing: "1.5px" }}>Interactive Pricing Builder</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#2E251F", letterSpacing: "-0.5px", marginTop: 8, marginBottom: 12 }}>Configure Your Custom Build</h2>
            <p style={{ fontSize: 16, color: "var(--text-muted)", maxWidth: 580, margin: "0 auto" }}>Select the features and mini-widgets you need. Everything is included in the flat ₹14,999/year package with zero hidden costs or extra add-on fees.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 32, alignItems: "start" }}>
            
            {/* Features List Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              
              {/* Premium Add-ons Section */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2E251F", marginBottom: 4 }}>Premium Modules (Included)</h3>
                {PRODUCT_CATALOG[selectedProduct].premiumFeatures.map(feature => {
                  const isSelected = selectedFeatures.includes(feature.name);
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.id}
                      onClick={() => toggleFeature(feature.name)}
                      style={{
                        background: "#ffffff",
                        border: isSelected ? "2.5px solid var(--orange)" : "1.5px solid var(--border)",
                        borderRadius: 14,
                        padding: "18px 20px",
                        cursor: "pointer",
                        display: "flex",
                        gap: 16,
                        alignItems: "flex-start",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected ? "0 4px 12px var(--orange-dim)" : "none"
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        border: isSelected ? "none" : "2px solid rgba(46, 37, 31, 0.2)",
                        background: isSelected ? "var(--orange)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2
                      }}>
                        {isSelected && <Check style={{ width: 12, height: 12, color: "#fff" }} />}
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 30, height: 30, background: isSelected ? "var(--orange-dim)" : "rgba(46, 37, 31, 0.04)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Icon style={{ width: 15, height: 15, color: isSelected ? "var(--orange)" : "var(--text-muted)" }} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: 14.5, color: "#2E251F" }}>{feature.name}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "var(--orange)" : "var(--text-muted)" }}>Included</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5, margin: "6px 0 0 0" }}>{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mini Add-ons Section */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2E251F", marginBottom: 4 }}>Mini Add-ons & Widgets (Included)</h3>
                {PRODUCT_CATALOG[selectedProduct].miniAddons.map(feature => {
                  const isSelected = selectedMiniAddons.includes(feature.name);
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.id}
                      onClick={() => toggleMiniAddon(feature.name)}
                      style={{
                        background: "#ffffff",
                        border: isSelected ? "2.5px solid var(--orange)" : "1.5px solid var(--border)",
                        borderRadius: 14,
                        padding: "18px 20px",
                        cursor: "pointer",
                        display: "flex",
                        gap: 16,
                        alignItems: "flex-start",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected ? "0 4px 12px var(--orange-dim)" : "none"
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        border: isSelected ? "none" : "2px solid rgba(46, 37, 31, 0.2)",
                        background: isSelected ? "var(--orange)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2
                      }}>
                        {isSelected && <Check style={{ width: 12, height: 12, color: "#fff" }} />}
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 30, height: 30, background: isSelected ? "var(--orange-dim)" : "rgba(46, 37, 31, 0.04)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Icon style={{ width: 15, height: 15, color: isSelected ? "var(--orange)" : "var(--text-muted)" }} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: 14.5, color: "#2E251F" }}>{feature.name}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "var(--orange)" : "var(--text-muted)" }}>Included</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5, margin: "6px 0 0 0" }}>{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Price Calculations Column */}
            <div style={{ background: "#ffffff", border: "1.5px solid var(--border)", borderRadius: 16, padding: "28px", boxShadow: "0 10px 30px rgba(46, 37, 31, 0.04)", position: "sticky", top: 80 }}>
              <div style={{ borderBottom: "1.5px solid var(--border)", paddingBottom: 16, marginBottom: 20 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "var(--orange)", textTransform: "uppercase", letterSpacing: "1px" }}>Price Calculation</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2E251F", margin: "4px 0 0 0" }}>Configuration Summary</h3>
              </div>

              {/* Base package breakdown */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700, color: "#2E251F" }}>
                  <span>{PRODUCT_CATALOG[selectedProduct].name} Base Package</span>
                  <span>₹{PRODUCT_CATALOG[selectedProduct].basePrice.toLocaleString()} / year</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0 0", lineHeight: 1.45 }}>
                  {PRODUCT_CATALOG[selectedProduct].baseDesc}
                </p>
              </div>

              {/* Selected Add-ons list */}
              <div style={{ marginBottom: 24, borderTop: "1px dashed var(--border)", paddingTop: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Selected Premium Add-ons ({selectedFeatures.length})</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                  {selectedFeatures.length === 0 ? (
                    <p style={{ fontSize: 12.5, color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>No premium features selected yet. Select from the list to add.</p>
                  ) : (
                    selectedFeatures.map(feat => (
                      <div key={feat} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#2E251F" }}>
                        <span>• {feat}</span>
                        <span style={{ fontWeight: 700 }}>Included</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Selected Mini Add-ons list */}
              <div style={{ marginBottom: 24, borderTop: "1px dashed var(--border)", paddingTop: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Selected Mini Add-ons ({selectedMiniAddons.length})</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                  {selectedMiniAddons.length === 0 ? (
                    <p style={{ fontSize: 12.5, color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>No mini add-ons selected yet. Select from the list to add.</p>
                  ) : (
                    selectedMiniAddons.map(feat => (
                      <div key={feat} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#2E251F" }}>
                        <span>• {feat}</span>
                        <span style={{ fontWeight: 700 }}>Included</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Totals panel */}
              <div style={{ background: "linear-gradient(135deg, var(--color-orange-50) 0%, var(--color-orange-100) 100%)", borderRadius: 12, padding: "20px", border: "1px solid var(--border)", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--orange)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Annual Subscription</span>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "#2E251F", letterSpacing: "-1px", marginTop: 4 }}>
                      ₹{totalPrice.toLocaleString()}<span style={{ fontSize: 16, fontWeight: 500, color: "var(--text-muted)" }}>/year</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Post-Sales Support</span>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#2E251F", marginTop: 4 }}>
                      Included
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                style={{
                  width: "100%",
                  background: "var(--orange)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  padding: "14px",
                  borderRadius: 30,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 16px var(--orange-dim)",
                  transition: "opacity 0.2s"
                }}
                onMouseOver={e => e.currentTarget.style.opacity = "0.9"}
                onMouseOut={e => e.currentTarget.style.opacity = "1"}
              >
                Book Setup Consultation →
              </button>

              <div style={{ marginTop: 16, textAlign: "center" }}>
                <Link href="/deck" style={{ color: "var(--orange)", fontWeight: 700, fontSize: 12.5, textDecoration: "none" }}>
                  Or view our 12-slide presentation first →
                </Link>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.4 }}>
                  No hidden sales calls. We provision your instance, map your domain, and hand you your logins within 24 hours.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Final Call to Action ── */}
      <section style={{ padding: "88px 24px", textAlign: "center", background: "linear-gradient(180deg, var(--color-orange-50) 0%, var(--color-orange-100) 100%)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ width: 56, height: 56, background: "var(--orange)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 24px var(--orange-dim)" }}>
            <Code2 style={{ width: 28, height: 28, color: "#fff" }} />
          </div>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#2E251F", letterSpacing: "-0.5px", marginBottom: 14 }}>Ready to launch your flat-rate system?</h2>
          <p style={{ fontSize: 17, color: "var(--text-muted)", marginBottom: 36, lineHeight: 1.6 }}>Work directly with us to configure your system, import your existing data, and launch your flat-rate subscription.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="#software-builder" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--orange)", color: "#fff", fontWeight: 700, fontSize: 16, padding: "14px 32px", borderRadius: 30, textDecoration: "none", boxShadow: "0 8px 20px var(--orange-dim)" }}>
              Configure Your Build <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <a href="https://wa.me/919740615639" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-dark)", fontWeight: 600, fontSize: 15, padding: "14px 24px", borderRadius: 30, textDecoration: "none", border: "1.5px solid var(--border)", background: "#fff" }}>
              <MessageSquare style={{ width: 16, height: 16 }} /> WhatsApp: +91 97406 15639
            </a>
            <Link href="/deck" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-dark)", fontWeight: 600, fontSize: 15, padding: "14px 24px", borderRadius: 30, textDecoration: "none", border: "1.5px solid var(--border)", background: "#fff" }}>
              View Presentation Deck
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: "28px 24px", borderTop: "1px solid rgba(0,0,0,0.05)", background: "#ffffff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, background: "var(--text-dark)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChefHat style={{ width: 14, height: 14, color: "#fff" }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#2E251F" }}>RestroPOS</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                © 2026 RestroPOS · Flat-rate all-inclusive restaurant billing & table QR system. · WhatsApp: +91 97406 15639
              </p>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <Link href="/login" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>Login</Link>
              <Link href="#software-builder" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>Software Configurator</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Lead Capture Modal ── */}
      {modalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(46, 37, 31, 0.4)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          padding: 16
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid var(--border)",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            maxWidth: 500,
            width: "100%",
            padding: "32px",
            position: "relative"
          }}>
            <button
              onClick={() => {
                setModalOpen(false);
                setSubmitSuccess(false);
                setLeadForm({ name: "", restaurantName: "", email: "", phone: "", notes: "" });
                setErrorMsg("");
              }}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                border: "none",
                background: "transparent",
                fontSize: 24,
                cursor: "pointer",
                color: "var(--text-muted)",
                fontWeight: 700
              }}
            >
              &times;
            </button>

            {submitSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{
                  width: 56,
                  height: 56,
                  background: "#dcfce7",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px"
                }}>
                  <Check style={{ width: 28, height: 28, color: "#16a34a" }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#2E251F", marginBottom: 10 }}>Compilation Booked!</h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 24 }}>
                  Thank you! We have registered your custom configuration request for <strong>{leadForm.restaurantName}</strong>. 
                  A detailed brief has been logged on our desk and sent to your email.
                </p>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", fontSize: 12.5, color: "var(--text-muted)", border: "1px solid var(--border)", marginBottom: 24 }}>
                  Lead Record Reference ID: <strong style={{ color: "#2E251F" }}>{leadId}</strong>
                </div>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setSubmitSuccess(false);
                    setLeadForm({ name: "", restaurantName: "", email: "", phone: "", notes: "" });
                    setSelectedFeatures([]);
                  }}
                  style={{
                    background: "var(--orange)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    padding: "12px 28px",
                    borderRadius: 30,
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Close &amp; Return
                </button>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#2E251F", marginBottom: 6 }}>Book Custom Compilation</h3>
                <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 20 }}>
                  We will arrange a meeting (in-person or short video call) to review your layout and compile your customized binaries.
                </p>

                <form onSubmit={handleLeadSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#2E251F", marginBottom: 6 }}>Your Name *</label>
                    <input
                      type="text"
                      required
                      value={leadForm.name}
                      onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                      placeholder="e.g. Nikhil Bhaviyavar"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13.5, color: "#2E251F", background: "#fff" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#2E251F", marginBottom: 6 }}>Business / Outlet Name *</label>
                    <input
                      type="text"
                      required
                      value={leadForm.restaurantName}
                      onChange={e => setLeadForm({ ...leadForm, restaurantName: e.target.value })}
                      placeholder="e.g. Spice Garden Cafe or Oakridge Hotel"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13.5, color: "#2E251F", background: "#fff" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#2E251F", marginBottom: 6 }}>Email *</label>
                      <input
                        type="email"
                        required
                        value={leadForm.email}
                        onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                        placeholder="nik@example.com"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13.5, color: "#2E251F", background: "#fff" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#2E251F", marginBottom: 6 }}>Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={leadForm.phone}
                        onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                        placeholder="+91 XXXXX XXXXX"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13.5, color: "#2E251F", background: "#fff" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#2E251F", marginBottom: 6 }}>Custom Requirements / Notes (Optional)</label>
                    <textarea
                      value={leadForm.notes}
                      onChange={e => setLeadForm({ ...leadForm, notes: e.target.value })}
                      placeholder="Any specific layout, database config, or integration questions..."
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13.5, height: 72, resize: "none", color: "#2E251F", background: "#fff" }}
                    />
                  </div>

                  {errorMsg && (
                    <div style={{ color: "#ef4444", fontSize: 12.5, fontWeight: 600 }}>{errorMsg}</div>
                  )}

                  <div style={{ marginTop: 8, display: "flex", gap: 12, alignItems: "center", background: "#fdf8f6", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
                      Selected Premium: <strong>{selectedFeatures.length}</strong> · Mini: <strong>{selectedMiniAddons.length}</strong> <br />
                      Total Price: <strong style={{ color: "var(--orange)" }}>₹{totalPrice.toLocaleString()} / year</strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      background: "var(--orange)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                      padding: "12px",
                      borderRadius: 30,
                      border: "none",
                      cursor: "pointer",
                      marginTop: 8,
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? "Registering Lead..." : "Submit Configuration"}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
