"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Upload, Download, ImageIcon, Palette, RefreshCw, Wand2, MessageSquare, Send, Megaphone, Check, Tag } from "lucide-react";
import { PromotionsTab } from "./promotions-tab";
import { OffersTab } from "./offers-tab";

type Restaurant = { id: string; name: string; address: string | null; logo: string | null; brandColor: string; tagline: string | null };
type Customer = { id: string; name: string; phone: string };
type MenuItem = { id: string; name: string; price: number };

const FORMATS = [
  { key: "square", label: "Square", sub: "1:1 · Instagram Post", emoji: "⬛" },
  { key: "story", label: "Story", sub: "9:16 · Instagram Story", emoji: "📱" },
  { key: "banner", label: "Banner", sub: "16:9 · Facebook Cover", emoji: "🖼" },
] as const;

export function MarketingClient({ restaurant: initial, customers = [], menuItems = [] }: {
  restaurant: Restaurant | null;
  customers?: Customer[];
  menuItems?: MenuItem[];
}) {
  const [tab, setTab] = useState<"create" | "chat" | "promotions" | "brand" | "offers">("create");
  const [mode, setMode] = useState<"photo" | "ai">("ai");
  const [format, setFormat] = useState<"square" | "story" | "banner">("square");
  const [form, setForm] = useState({ dishName: "", offerText: "", price: "", originalPrice: "" });
  const [foodPhoto, setFoodPhoto] = useState<File | null>(null);
  const [foodPhotoPreview, setFoodPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ image: string; mimeType: string } | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Chat state
  type ChatMsg = { role: "user" | "model"; parts: any[]; display: { type: "text" | "image"; content: string; mimeType?: string }[] };
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatLoading(true);
    const history = chatMessages.map((m) => ({ role: m.role, parts: m.parts }));
    setChatMessages((prev) => [...prev, { role: "user", parts: [{ text: userMsg }], display: [{ type: "text" as const, content: userMsg }] }]);
    const res = await fetch("/api/marketing/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg, history }),
    });
    const data = await res.json();
    setChatLoading(false);
    if (data.error) {
      setChatMessages((prev) => [...prev, { role: "model", parts: [{ text: data.error }], display: [{ type: "text" as const, content: `Error: ${data.error}` }] }]);
      return;
    }
    setChatMessages((prev) => [...prev, { role: "model", parts: data.modelParts, display: data.result }]);
  }

  // Brand settings
  const [brand, setBrand] = useState({
    brandColor: initial?.brandColor || "#f97316",
    tagline: initial?.tagline || "",
    logo: initial?.logo || "",
  });
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandSaved, setBrandSaved] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoodPhoto(file);
    setFoodPhotoPreview(URL.createObjectURL(file));
  }

  async function generate() {
    if (!form.dishName || !form.offerText) { setError("Fill in dish name and offer text"); return; }
    if (mode === "photo" && !foodPhoto) { setError("Upload a food photo for this mode"); return; }
    setError("");
    setLoading(true);
    setResult(null);

    const fd = new FormData();
    fd.append("mode", mode);
    fd.append("dishName", form.dishName);
    fd.append("offerText", form.offerText);
    fd.append("price", form.price);
    fd.append("originalPrice", form.originalPrice);
    fd.append("format", format);
    if (mode === "photo" && foodPhoto) fd.append("foodPhoto", foodPhoto);

    const res = await fetch("/api/marketing/generate-poster", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Generation failed"); return; }
    setResult(data);
  }

  function download() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = `data:${result.mimeType};base64,${result.image}`;
    a.download = `${form.dishName.replace(/\s+/g, "_")}_poster.png`;
    a.click();
  }

  async function saveBrand() {
    setBrandSaving(true);
    await fetch("/api/marketing/brand", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brand),
    });
    setBrandSaving(false);
    setBrandSaved(true);
    setTimeout(() => setBrandSaved(false), 2000);
  }

  return (
    <div className="p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500" /> Marketing Studio
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Generate AI-powered marketing posters for your restaurant</p>
        </div>
        <div className="flex gap-2 rounded-xl p-1 flex-wrap" style={{ background: "rgba(255,255,255,0.07)" }}>
          {[
            { key: "create", label: "Poster Maker", icon: Wand2 },
            { key: "chat", label: "AI Chat", icon: MessageSquare },
            { key: "promotions", label: "Promotions", icon: Megaphone },
            { key: "offers", label: "Offers Manager", icon: Tag },
            { key: "brand", label: "Brand Kit", icon: Palette },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all`}
              style={tab === key
                ? { background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.95)" }
                : { color: "rgba(255,255,255,0.5)" }}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Create Poster Tab ── */}
      {tab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Controls */}
          <div className="space-y-5">
            {/* Mode selector */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-sm font-semibold mb-3" style={{ color: "rgba(255,255,255,0.8)" }}>Generation Mode</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode("ai")}
                  className={`p-4 rounded-xl border-2 text-left transition-all`}
                  style={mode === "ai"
                    ? { borderColor: "#f97316", background: "rgba(249,115,22,0.1)" }
                    : { borderColor: "rgba(255,255,255,0.12)" }}
                >
                  <div className="text-2xl mb-1">🤖</div>
                  <p className="font-semibold text-sm text-white">AI Generated</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>AI creates the food image from scratch</p>
                </button>
                <button
                  onClick={() => setMode("photo")}
                  className={`p-4 rounded-xl border-2 text-left transition-all`}
                  style={mode === "photo"
                    ? { borderColor: "#f97316", background: "rgba(249,115,22,0.1)" }
                    : { borderColor: "rgba(255,255,255,0.12)" }}
                >
                  <div className="text-2xl mb-1">📸</div>
                  <p className="font-semibold text-sm text-white">Your Photo</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Upload your food photo, AI designs the poster</p>
                </button>
              </div>
            </div>

            {/* Photo upload (mode: photo) */}
            {mode === "photo" && (
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-sm font-semibold mb-3" style={{ color: "rgba(255,255,255,0.8)" }}>Food Photo</p>
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                {foodPhotoPreview ? (
                  <div className="relative">
                    <img src={foodPhotoPreview} alt="Food" className="w-full h-40 object-cover rounded-xl" />
                    <button
                      onClick={() => { setFoodPhoto(null); setFoodPhotoPreview(null); }}
                      className="absolute top-2 right-2 rounded-lg px-2 py-1 text-xs font-semibold shadow"
                      style={{ background: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.9)" }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.15)" }}
                  >
                    <Upload className="w-6 h-6" style={{ color: "rgba(255,255,255,0.4)" }} />
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Click to upload food photo</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>JPG, PNG · High quality recommended</span>
                  </button>
                )}
              </div>
            )}

            {/* Poster details */}
            <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>Poster Details</p>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Dish Name *</label>
                <Input className="mt-1" placeholder="e.g. Chicken Biryani" value={form.dishName} onChange={(e) => setForm({ ...form, dishName: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Offer / Headline *</label>
                <Input className="mt-1" placeholder="e.g. 50% Off Today Only!" value={form.offerText} onChange={(e) => setForm({ ...form, offerText: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Offer Price</label>
                  <Input className="mt-1" placeholder="₹199" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Original Price</label>
                  <Input className="mt-1" placeholder="₹399" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Format */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-sm font-semibold mb-3" style={{ color: "rgba(255,255,255,0.8)" }}>Format</p>
              <div className="grid grid-cols-3 gap-2">
                {FORMATS.map(({ key, label, sub, emoji }) => (
                  <button
                    key={key}
                    onClick={() => setFormat(key)}
                    className={`p-3 rounded-xl border-2 text-center transition-all`}
                    style={format === key
                      ? { borderColor: "#f97316", background: "rgba(249,115,22,0.1)" }
                      : { borderColor: "rgba(255,255,255,0.12)" }}
                  >
                    <div className="text-xl mb-1">{emoji}</div>
                    <p className="font-semibold text-xs text-white">{label}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <Button onClick={generate} disabled={loading} className="w-full h-12 text-base">
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating poster...</>
                : <><Sparkles className="w-5 h-5" /> Generate Poster</>}
            </Button>

            {loading && (
              <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>This takes 15-30 seconds. Nano Banana is thinking...</p>
            )}
          </div>

          {/* Right: Preview */}
          <div className="rounded-2xl flex flex-col" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", minHeight: 500 }}>
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="font-semibold flex items-center gap-2 text-white">
                <ImageIcon className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} /> Preview
              </p>
              {result && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={generate} disabled={loading}>
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </Button>
                  <Button size="sm" onClick={download}>
                    <Download className="w-3 h-3" /> Download
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
              {loading ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Nano Banana is creating your poster</p>
                    <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Generating food visuals, compositing layout, rendering text...</p>
                  </div>
                  <div className="flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              ) : result ? (
                <div className="w-full">
                  <img
                    src={`data:${result.mimeType};base64,${result.image}`}
                    alt="Generated poster"
                    className={`mx-auto rounded-xl shadow-lg ${format === "story" ? "max-h-[500px] w-auto" : "w-full max-w-md"}`}
                  />
                  <p className="text-center text-xs mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Right-click → Save image, or use the Download button
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <ImageIcon className="w-8 h-8" style={{ color: "rgba(255,255,255,0.2)" }} />
                  </div>
                  <p className="font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Your poster will appear here</p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Fill in the details and click Generate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Chat Tab ── */}
      {tab === "chat" && (
        <div className="flex flex-col rounded-2xl overflow-hidden"
          style={{ height: "calc(100vh - 200px)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">AI Creative Chat</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Describe any creative and Nano Banana will make it</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)" }}>
                  <Sparkles className="w-7 h-7 text-orange-500" />
                </div>
                <div>
                  <p className="font-semibold text-white">Start a conversation</p>
                  <p className="text-sm mt-1 max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>Describe the creative you want. Try:</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Make a Biryani promotion poster for Sunday", "Create a happy hours banner, 6-9pm, 20% off drinks", "Design a Diwali special offer poster", "Make a new menu launch announcement"].map((s) => (
                    <button key={s} onClick={() => setChatInput(s)}
                      className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors text-left">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] space-y-2 flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {msg.display.map((part, j) => (
                    part.type === "text" ? (
                      <div key={j} className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "text-white rounded-br-sm" : "rounded-bl-sm"}`}
                        style={msg.role === "user"
                          ? { background: "linear-gradient(135deg, #f97316, #ea580c)" }
                          : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)" }}>
                        {part.content}
                      </div>
                    ) : (
                      <div key={j} className="space-y-2">
                        <img src={`data:${part.mimeType || "image/png"};base64,${part.content}`} alt="Generated" className="rounded-2xl max-w-full shadow-lg" style={{ maxHeight: 400, border: "1px solid rgba(255,255,255,0.08)" }} />
                        <a href={`data:${part.mimeType || "image/png"};base64,${part.content}`} download="creative.png"
                          className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 font-semibold">
                          <Download className="w-3 h-3" /> Download image
                        </a>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2"
                  style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="flex gap-1">
                    {[0,1,2].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Nano Banana is creating...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex gap-2">
              <input
                className="flex-1 h-11 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}
                placeholder="Describe the creative you want..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChat()}
                disabled={chatLoading}
              />
              <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading}
                className="w-11 h-11 rounded-xl text-white flex items-center justify-center disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs mt-1.5 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>Press Enter to send · Images take 15-30 seconds</p>
          </div>
        </div>
      )}

      {/* ── Promotions Tab ── */}
      {tab === "promotions" && (
        <PromotionsTab customers={customers} menuItems={menuItems} restaurantName={initial?.name || "Restaurant"} />
      )}

      {/* ── Brand Kit Tab ── */}
      {tab === "brand" && (
        <div className="max-w-xl space-y-5">
          <div className="rounded-2xl p-6 space-y-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <p className="font-semibold text-white mb-1">Brand Kit</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>These details are automatically included in every poster you generate.</p>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1.5 text-white">Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brand.brandColor}
                  onChange={(e) => setBrand({ ...brand, brandColor: e.target.value })}
                  className="w-12 h-10 rounded-xl cursor-pointer p-0.5"
                  style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                />
                <Input
                  value={brand.brandColor}
                  onChange={(e) => setBrand({ ...brand, brandColor: e.target.value })}
                  placeholder="#f97316"
                  className="flex-1"
                />
                <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: brand.brandColor, border: "1px solid rgba(255,255,255,0.12)" }} />
              </div>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Used for text overlays, badges, and accents in your posters</p>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1.5 text-white">Tagline</label>
              <Input
                value={brand.tagline}
                onChange={(e) => setBrand({ ...brand, tagline: e.target.value })}
                placeholder="e.g. Authentic flavours since 2010"
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1.5 text-white">Logo URL</label>
              <Input
                value={brand.logo}
                onChange={(e) => setBrand({ ...brand, logo: e.target.value })}
                placeholder="https://your-logo-url.com/logo.png"
              />
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Paste a direct link to your logo image (PNG with transparent background works best)</p>
            </div>

            {brand.logo && (
              <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                <img src={brand.logo} alt="Logo preview" className="w-12 h-12 object-contain rounded-lg" onError={(e) => (e.currentTarget.style.display = "none")} />
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Logo preview</p>
              </div>
            )}

            <Button onClick={saveBrand} disabled={brandSaving} className="w-full">
              {brandSaved ? "✓ Saved!" : brandSaving ? "Saving..." : "Save Brand Kit"}
            </Button>
          </div>

          <div className="rounded-2xl p-5" style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
            <p className="font-semibold text-orange-400 mb-3">Tips for better posters</p>
            <ul className="space-y-2 text-sm text-orange-300">
              <li>📸 Use high-resolution food photos (at least 1080px) for Mode 1</li>
              <li>🎨 Pick a brand color that matches your restaurant&apos;s vibe</li>
              <li>✍️ Keep offer text short and punchy — &quot;50% Off Today!&quot; beats &quot;Get 50% discount on all items today only&quot;</li>
              <li>🔄 Regenerate 2-3 times to get different layouts and pick the best one</li>
              <li>📱 Use Story format for Instagram Stories and Reels covers</li>
            </ul>
          </div>
        </div>
      )}

      {/* ── Offers Manager Tab ── */}
      {tab === "offers" && initial?.id && (
        <OffersTab restaurantId={initial.id} />
      )}
    </div>
  );
}
