"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "email" | "otp" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setStep("otp");
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setStep("done");
    setTimeout(() => router.push("/login"), 2500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === "email" && "Forgot Password"}
            {step === "otp" && "Reset Password"}
            {step === "done" && "Password Updated"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === "email" && "Enter your email to receive a reset code"}
            {step === "otp" && `Enter the code sent to ${email}`}
            {step === "done" && "Redirecting to login..."}
          </p>
        </div>

        {step === "email" && (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input className="mt-1" type="email" placeholder="owner@restaurant.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send Reset Code"}
            </Button>
            <a href="/login" className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-3 h-3" /> Back to login
            </a>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={resetPassword} className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <p className="text-sm text-gray-600">Check your inbox for the 6-digit code</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Verification Code</label>
              <Input className="mt-1 text-center text-2xl tracking-[0.5em] font-bold" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} required autoFocus />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <Input className="mt-1" type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <Input className="mt-1" type="password" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : "Reset Password"}
            </Button>
            <button type="button" onClick={() => setStep("email")} className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600 w-full">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <p className="text-gray-500 text-sm">Password updated successfully. Redirecting...</p>
            <Loader2 className="w-5 h-5 animate-spin text-orange-500 mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
