"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, UtensilsCrossed, Table2,
  Package, BarChart3, Users, Settings, LogOut, ChefHat,
  Wifi, Sparkles, UserCheck, Activity, Calendar, Server
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",     label: "Dashboard",        icon: LayoutDashboard },
  { href: "/pos",           label: "POS / Billing",    icon: ShoppingCart },
  { href: "/orders",        label: "Orders",           icon: UtensilsCrossed },
  { href: "/tables",        label: "Tables",           icon: Table2 },
  { href: "/marketing/reservations", label: "Reservations", icon: Calendar },
  { href: "/menu",          label: "Menu",             icon: ChefHat },
  { href: "/inventory",     label: "Inventory",        icon: Package },
  { href: "/online-orders", label: "Online Orders",    icon: Wifi },
  { href: "/customers",     label: "Customers",        icon: Users },
  { href: "/staff",         label: "Staff",            icon: UserCheck },
  { href: "/reports",       label: "Reports",          icon: BarChart3 },
  { href: "/marketing",     label: "Marketing",        icon: Sparkles },
  { href: "/dashboard/simulation", label: "Live Simulator", icon: Activity },
  { href: "/dashboard/tech-stack", label: "Tech Stack Used", icon: Server },
  { href: "/settings",      label: "Settings",         icon: Settings },
];

export function Sidebar({ restaurantName }: { restaurantName?: string }) {
  const pathname = usePathname();
  const [customPOSName, setCustomPOSName] = useState("RestroPOS");

  useEffect(() => {
    function updatePOSName() {
      const stored = localStorage.getItem("restropos-custom-name");
      if (stored) {
        const formatted = /pos$/i.test(stored) ? stored : `${stored} POS`;
        setCustomPOSName(formatted);
      } else if (restaurantName) {
        const formatted = /pos$/i.test(restaurantName) ? restaurantName : `${restaurantName} POS`;
        setCustomPOSName(formatted);
      } else {
        setCustomPOSName("RestroPOS");
      }
    }
    updatePOSName();
    window.addEventListener("storage", updatePOSName);
    return () => window.removeEventListener("storage", updatePOSName);
  }, [restaurantName]);

  return (
    <aside className="w-[200px] min-h-screen flex flex-col border-r" style={{ background: "var(--bg-1)", borderColor: "var(--border-2)", transition: "background var(--dur-normal), border-color var(--dur-normal)" }}>
      {/* Logo */}
      <div className="px-4 py-4 border-b" style={{ borderColor: "var(--border-2)", transition: "border-color var(--dur-normal)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-orange-500">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[var(--fg-1)] text-[13px] leading-none">{customPOSName}</p>
            <p className="text-[11px] text-[var(--fg-2)] truncate mt-0.5">{restaurantName || "Restaurant"}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors group",
                isActive
                  ? "nav-active"
                  : "text-[var(--fg-2)] hover:text-[var(--fg-1)] hover:bg-[var(--bg-hover)]"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", isActive ? "text-[var(--orange)]" : "text-[var(--fg-3)] group-hover:text-[var(--fg-2)]")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-2 py-2 border-t" style={{ borderColor: "var(--border-2)", transition: "border-color var(--dur-normal)" }}>
        <button
          onClick={async () => {
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.href = "/login";
                }
              }
            });
          }}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium w-full text-[var(--fg-2)] hover:text-[var(--fg-1)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0 text-[var(--fg-3)]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
