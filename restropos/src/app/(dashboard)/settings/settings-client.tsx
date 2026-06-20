"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Building2, Users, Plus, Palette } from "lucide-react";

const THEMES = [
  { name: "Bronze", value: "theme-bronze", color: "#d97706" },
  { name: "Emerald", value: "theme-emerald", color: "#10b981" },
  { name: "Violet", value: "theme-violet", color: "#8b5cf6" },
  { name: "Ocean", value: "theme-ocean", color: "#06b6d4" },
  { name: "Cabernet", value: "theme-cabernet", color: "#be123c" },
  { name: "Matcha", value: "theme-matcha", color: "#65a30d" },
  { name: "Espresso", value: "theme-espresso", color: "#ca8a04" },
  { name: "Cyber", value: "theme-cyber", color: "#db2777" },
];

export function SettingsClient({ restaurant, users, restaurantId }: { restaurant: any; users: any[]; restaurantId: string }) {
  const router = useRouter();
  const [restForm, setRestForm] = useState({ name: restaurant?.name || "", address: restaurant?.address || "", phone: restaurant?.phone || "", gstin: restaurant?.gstin || "" });
  const [userDialog, setUserDialog] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "CASHIER" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [activeTheme, setActiveTheme] = useState("theme-cabernet");
  const [activeMode, setActiveMode] = useState("mode-dark");

  useEffect(() => {
    const storedTheme = localStorage.getItem("restropos-theme") || "theme-cabernet";
    setActiveTheme(storedTheme);
    const storedMode = localStorage.getItem("restropos-mode") || "mode-dark";
    setActiveMode(storedMode);
  }, []);

  const changeTheme = (theme: string) => {
    localStorage.setItem("restropos-theme", theme);
    const classes = Array.from(document.documentElement.classList);
    classes.forEach(c => {
      if (c.startsWith("theme-")) {
        document.documentElement.classList.remove(c);
      }
    });
    document.documentElement.classList.add(theme);
    setActiveTheme(theme);
    window.dispatchEvent(new Event("storage"));
  };

  const changeMode = (mode: string) => {
    localStorage.setItem("restropos-mode", mode);
    document.documentElement.classList.remove("mode-dark", "mode-light");
    document.documentElement.classList.add(mode);
    setActiveMode(mode);
    window.dispatchEvent(new Event("storage"));
  };

  async function saveRestaurant() {
    setLoading(true);
    await fetch(`/api/restaurant/${restaurantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(restForm),
    });
    localStorage.setItem("restropos-custom-name", restForm.name);
    window.dispatchEvent(new Event("storage"));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addUser() {
    setUserLoading(true);
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userForm, restaurantId }),
    });
    setUserLoading(false);
    setUserDialog(false);
    setUserForm({ name: "", email: "", password: "", role: "CASHIER" });
    router.refresh();
  }

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--fg-1)]">Settings</h1>

      {/* Restaurant Info */}
      <div className="rounded-xl p-6 space-y-4" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-orange-500" />
          <h2 className="font-semibold text-[var(--fg-1)]">Restaurant Information</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium text-[var(--fg-2)]">Restaurant Name</label>
            <Input value={restForm.name} onChange={(e) => setRestForm({ ...restForm, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--fg-2)]">Phone</label>
            <Input value={restForm.phone} onChange={(e) => setRestForm({ ...restForm, phone: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--fg-2)]">GSTIN</label>
            <Input value={restForm.gstin} onChange={(e) => setRestForm({ ...restForm, gstin: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-[var(--fg-2)]">Address</label>
            <Input value={restForm.address} onChange={(e) => setRestForm({ ...restForm, address: e.target.value })} />
          </div>
        </div>
        <Button onClick={saveRestaurant} disabled={loading}>
          {saved ? "Saved!" : loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Theme & Display Mode Settings */}
      <div className="rounded-xl p-6 space-y-6" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold text-[var(--fg-1)]">POS Branding & Theme</h2>
          </div>
          <p className="text-xs text-[var(--fg-3)]">
            Customize the color profile of the POS dashboard terminal. Updates apply instantly to your display.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {THEMES.map(t => (
              <button
                key={t.value}
                onClick={() => changeTheme(t.value)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer animate-none"
                style={{
                  background: activeTheme === t.value ? "var(--bg-active)" : "var(--bg-1)",
                  borderColor: activeTheme === t.value ? "var(--orange)" : "var(--border-2)",
                  color: activeTheme === t.value ? "var(--orange)" : "var(--fg-2)",
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: t.color,
                    display: "inline-block",
                  }}
                />
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Display Mode Selection */}
        <div className="space-y-3 pt-4 border-t border-[var(--border-1)]">
          <h3 className="text-xs font-semibold text-[var(--fg-2)] uppercase tracking-wide">Display Mode</h3>
          <div className="flex gap-3">
            {[
              { name: "Dark Mode", value: "mode-dark" },
              { name: "Light Mode", value: "mode-light" }
            ].map(m => (
              <button
                key={m.value}
                onClick={() => changeMode(m.value)}
                className="px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: activeMode === m.value ? "var(--bg-active)" : "var(--bg-1)",
                  borderColor: activeMode === m.value ? "var(--orange)" : "var(--border-2)",
                  color: activeMode === m.value ? "var(--orange)" : "var(--fg-2)",
                }}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Management */}
      <div className="rounded-xl p-6 space-y-4" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold text-[var(--fg-1)]">Staff Management</h2>
          </div>
          <Button size="sm" onClick={() => setUserDialog(true)}><Plus className="w-4 h-4" /> Add Staff</Button>
        </div>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "var(--bg-3)", border: "1px solid var(--border-1)" }}>
              <div>
                <p className="font-medium text-sm text-[var(--fg-1)]">{u.name}</p>
                <p className="text-xs text-[var(--fg-3)]">{u.email}</p>
              </div>
              <Badge variant={u.role === "OWNER" ? "default" : "secondary"}>{u.role}</Badge>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={userDialog} onOpenChange={setUserDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-[var(--fg-2)]">Name *</label>
              <Input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--fg-2)]">Email *</label>
              <Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--fg-2)]">Password *</label>
              <Input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--fg-2)]">Role</label>
              <select
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ background: "var(--bg-1)", border: "1px solid var(--border-2)", color: "var(--fg-1)" }}
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              >
                {["CASHIER", "CAPTAIN", "MANAGER"].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <Button onClick={addUser} disabled={userLoading || !userForm.name || !userForm.email || !userForm.password} className="w-full">
              {userLoading ? "Adding..." : "Add Staff"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
