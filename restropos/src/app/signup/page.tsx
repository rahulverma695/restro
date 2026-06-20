"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { ChefHat, Loader2, ArrowRight, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [restaurantName, setRestaurantName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Sign up the user via Neon Auth
      const signupRes = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (signupRes.error) {
        setError(signupRes.error.message || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Initialize Restaurant and Owner record in public schema
      const registerDbRes = await fetch("/api/auth/register-restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, phone, restaurantName }),
      });

      const dbData = await registerDbRes.json();
      if (!registerDbRes.ok) {
        setError(dbData.error || "Failed to initialize restaurant database records.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Wait a moment for visual confirmation and route to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during signup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row">
      {/* Left Column — Value Proposition / Premium Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.06),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <ChefHat className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-semibold text-white text-[15px]">RestroPOS</span>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> High-Ticket SaaS Onboarding
            </div>
            <h1 className="text-[40px] font-semibold text-white leading-tight tracking-tight">
              Scale your restaurant operations.<br />
              <span className="text-white/30">Instantly.</span>
            </h1>
            <p className="text-[15px] text-white/40 leading-relaxed max-w-sm">
              Launch self-ordering QR tables, manage multiple billing terminals, track inventory wastage, and exports GST reports instantly.
            </p>
          </div>
        </div>

        <div className="relative space-y-3">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] max-w-sm">
            <p className="text-[13px] text-white/70 italic">"The QR code ordering saved us 2 servers per shift, and the database isolation guarantees zero-trust customer session security."</p>
            <p className="text-[11px] text-orange-400 font-medium mt-2">— Spice Garden, Bangalore</p>
          </div>
          <p className="text-[12px] text-white/20 pt-3">Trusted by over 40+ high-volume outlets across India.</p>
        </div>
      </div>

      {/* Right Column — Elegant Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-[24px] font-semibold text-white mb-1.5">Create your POS Account</h2>
            <p className="text-[13px] text-white/35">Start managing your restaurant setup in minutes.</p>
          </div>

          {success ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
              <h3 className="text-[16px] font-semibold text-white">Database Initialized!</h3>
              <p className="text-[13px] text-white/60">Your restaurant account and menus are ready. Redirecting to dashboard...</p>
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-red-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-[12.5px] leading-normal">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-white/40 block mb-1.5 font-medium">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Nik Bhaviyavar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-white/[0.04] border border-white/10 text-[13px] text-white placeholder:text-white/20 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-white/40 block mb-1.5 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-white/[0.04] border border-white/10 text-[13px] text-white placeholder:text-white/20 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] text-white/40 block mb-1.5 font-medium">Restaurant Name</label>
                <input
                  type="text"
                  required
                  placeholder="Spice Garden Kitchen"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-white/[0.04] border border-white/10 text-[13px] text-white placeholder:text-white/20 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[12px] text-white/40 block mb-1.5 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="owner@spicegarden.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-white/[0.04] border border-white/10 text-[13px] text-white placeholder:text-white/20 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[12px] text-white/40 block mb-1.5 font-medium">Create Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-white/[0.04] border border-white/10 text-[13px] text-white placeholder:text-white/20 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-md bg-orange-500 hover:bg-orange-400 text-white text-[13.5px] font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-colors mt-6 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Initializing Workspace...
                  </>
                ) : (
                  <>
                    Complete Signup <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-[12px] text-white/25">
            Already have an account?{" "}
            <a href="/login" className="text-orange-400 hover:text-orange-300 transition-colors">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
}
