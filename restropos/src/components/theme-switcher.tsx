"use client";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

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

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState("theme-cabernet");

  useEffect(() => {
    const stored = localStorage.getItem("restropos-theme") || "theme-cabernet";
    setActiveTheme(stored);
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
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "5px 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <Sparkles style={{ width: 13, height: 13, color: "#64748b" }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Theme Tester:</span>
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {THEMES.map(t => (
          <button
            key={t.value}
            onClick={() => changeTheme(t.value)}
            title={t.name}
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: t.color,
              border: activeTheme === t.value ? "2px solid #0f172a" : "2px solid transparent",
              boxShadow: activeTheme === t.value ? "0 0 0 1px #94a3b8" : "none",
              cursor: "pointer",
              transition: "transform 0.1s",
              transform: activeTheme === t.value ? "scale(1.15)" : "scale(1)",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
