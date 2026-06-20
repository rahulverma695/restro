"use client";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { ChefHat, Loader2, Eye, EyeOff, ArrowRight, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "true") {
        handleDemoLogin();
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await authClient.signIn.email({
      email,
      password,
    });
    setLoading(false);
    if (error) setError(error.message || "Invalid email or password");
    else router.push("/dashboard");
  }

  async function handleDemoLogin() {
    setDemoLoading(true); setError("");
    const { error } = await authClient.signIn.email({
      email: "nikkibhaviyavar+spicegarden@gmail.com",
      password: "Spice@123",
    });
    setDemoLoading(false);
    if (error) setError("Demo login failed. Please try again.");
    else router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.08),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <ChefHat className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-semibold text-white text-[15px]">RestroPOS</span>
          </div>
          <h1 className="text-[40px] font-semibold text-white leading-tight tracking-tight mb-4">
            Run your restaurant<br />
            <span className="text-white/30">smarter.</span>
          </h1>
          <p className="text-[15px] text-white/40 leading-relaxed max-w-sm">
            Complete POS, inventory, billing and analytics — built for Indian restaurants.
          </p>
        </div>

        <div className="relative space-y-3">
          {["3-click billing, zero training needed", "Real-time reports & GST export", "Table QR self-ordering built in"].map(t => (
            <div key={t} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
              <span className="text-[13px] text-white/40">{t}</span>
            </div>
          ))}
          <p className="text-[12px] text-white/20 pt-3">₹14,999/year · All-inclusive flat subscription</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white text-[14px]">RestroPOS</span>
          </div>

          <h2 className="text-[22px] font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-[13px] text-white/35 mb-6">Sign in to your dashboard</p>

          {/* Quick Live Demo Section */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading || loading}
              className="w-full h-11 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {demoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <Zap className="w-4 h-4 text-white fill-white" />
                  Explore Live Demo (One-Click)
                </>
              )}
            </button>
            <div className="flex items-center my-5">
              <div className="flex-1 border-t border-white/10" />
              <span className="px-3 text-[10px] text-white/30 uppercase tracking-wider font-semibold">Or client sign in</span>
              <div className="flex-1 border-t border-white/10" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[12px] text-white/40 block mb-1.5">Email</label>
              <input type="email" placeholder="owner@restaurant.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                className="w-full h-9 px-3 rounded-md bg-white/[0.05] border border-white/10 text-[13px] text-white/90 placeholder:text-white/20 focus:border-orange-500 focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-[12px] text-white/40 block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full h-9 px-3 pr-9 rounded-md bg-white/[0.05] border border-white/10 text-[13px] text-white/90 placeholder:text-white/20 focus:border-orange-500 focus:outline-none transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a href="/forgot-password" className="text-[12px] text-white/30 hover:text-orange-400 transition-colors">Forgot password?</a>
            </div>

            {error && (
              <div className="px-3 py-2 rounded-md bg-red-500/10 border border-red-500/20 text-[12px] text-red-400">{error}</div>
            )}

            <button type="submit" disabled={loading || demoLoading}
              className="w-full h-9 rounded-md bg-orange-500 hover:bg-orange-400 text-white text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-colors mt-1">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Sign In <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </form>

          <p className="text-center text-[12px] text-white/25 mt-6">
            Want a custom POS for your outlet?{" "}
            <a href="/#pos-builder" className="text-orange-400 hover:text-orange-300 transition-colors">Configure & Book Call</a>
          </p>
        </div>
      </div>
    </div>
  );
}
