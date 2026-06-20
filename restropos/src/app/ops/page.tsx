"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type PlatformKPIs = {
  totalRestaurants: number;
  activeRestaurants: number;
  newThisWeek: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
};

type Restaurant = {
  id: string;
  name: string;
  address: string;
  phone: string;
  createdAt: string;
  totalOrders: number;
  menuItems: number;
  customers: number;
  staff: number;
  tables: number;
  totalRevenue: number;
  revenueThisMonth: number;
  ordersToday: number;
  ordersThisWeek: number;
  lastOrderAt: string | null;
  isActive: boolean;
};

type RecentSignup = {
  id: string;
  name: string;
  createdAt: string;
  phone: string;
};

type OrderSource = {
  source: string;
  _count: number;
};

type DailyTrend = {
  date: string;
  orders: number;
  revenue: number;
};

type HealthCheck = {
  name: string;
  ok: boolean;
  lastMs: number;
  uptime: number;
};

type AdminData = {
  platform: PlatformKPIs;
  restaurants: Restaurant[];
  recentSignups: RecentSignup[];
  orderSources: OrderSource[];
  dailyTrend: DailyTrend[];
  health: HealthCheck[];
  generatedAt: string;
};

type MetricsData = {
  platform: {
    totalRestaurants: number;
    newThisWeek: number;
    newThisMonth: number;
    totalOrders: number;
    ordersThisWeek: number;
    activeRestaurants: number;
  };
  uptime: {
    name: string;
    uptime24h: number;
    uptime7d: number;
    avgMs: number;
    status: boolean;
    lastChecked: string;
  }[];
  responseTrend: { hour: string; avgMs: number }[];
  recentErrors: {
    endpoint: string;
    method: string;
    statusCode: number;
    message: string;
    occurredAt: string;
  }[];
  lastUpdated: string;
};

export default function OpsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [opsKey, setOpsKey] = useState("");
  const [loginError, setLoginError] = useState("");
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [healthCheckRunning, setHealthCheckRunning] = useState(false);

  const fetchData = useCallback(async (key: string) => {
    setLoading(true);
    try {
      const [adminRes, metricsRes] = await Promise.all([
        fetch(`/api/ops/admin?key=${key}`),
        fetch(`/api/ops/metrics?key=${key}`),
      ]);

      if (adminRes.ok && metricsRes.ok) {
        const admin = await adminRes.json();
        const metrics = await metricsRes.json();
        setAdminData(admin);
        setMetricsData(metrics);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/ops/metrics?key=${password}`);
      if (res.status === 401) {
        setLoginError("Invalid password");
        setLoading(false);
        return;
      }

      if (res.ok) {
        setOpsKey(password);
        setIsAuthenticated(true);
        await fetchData(password);
      }
    } catch (error) {
      setLoginError("Connection error");
      setLoading(false);
    }
  };

  const handleRunHealthCheck = async () => {
    setHealthCheckRunning(true);
    try {
      await fetch("/api/ops/cron", {
        method: "POST",
        headers: {
          "x-ops-key": opsKey,
        },
      });
      // Refresh data after health check
      await fetchData(opsKey);
    } catch (error) {
      console.error("Health check failed:", error);
    } finally {
      setHealthCheckRunning(false);
    }
  };

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (!isAuthenticated || !opsKey) return;

    const interval = setInterval(() => {
      fetchData(opsKey);
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, opsKey, fetchData]);

  // Login screen
  if (!isAuthenticated) {
    return (
      <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "40px", width: "400px", maxWidth: "90%" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
              RestroPOS
            </h1>
            <div style={{ display: "inline-block", background: "#f97316", color: "#000", fontSize: "11px", fontWeight: "700", padding: "4px 12px", borderRadius: "6px", letterSpacing: "0.5px" }}>
              GOD MODE
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "13px", marginBottom: "8px", fontWeight: "500" }}>
                Ops Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter ops password"
                style={{
                  width: "100%",
                  background: "#000",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                }}
                disabled={loading}
              />
              {loginError && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "8px" }}>
                  {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: "100%",
                background: "#f97316",
                color: "#000",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading || !password ? "not-allowed" : "pointer",
                opacity: loading || !password ? 0.5 : 1,
              }}
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  const systemOk = metricsData?.uptime.every((u) => u.status) ?? true;

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#fff" }}>
      {/* Top bar */}
      <div style={{ background: "#111", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700" }}>RestroPOS</h1>
            <div style={{ background: "#f97316", color: "#000", fontSize: "10px", fontWeight: "700", padding: "4px 10px", borderRadius: "6px", letterSpacing: "0.5px" }}>
              GOD MODE
            </div>
            <div
              style={{
                background: systemOk ? "#10b981" : "#ef4444",
                color: "#000",
                fontSize: "11px",
                fontWeight: "600",
                padding: "4px 10px",
                borderRadius: "6px",
              }}
            >
              {systemOk ? "● ALL SYSTEMS OPERATIONAL" : "● SYSTEM ISSUES"}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {lastUpdated && (
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                Updated {format(lastUpdated, "HH:mm:ss")}
              </span>
            )}
            <button
              onClick={() => fetchData(opsKey)}
              disabled={loading}
              style={{
                background: "#222",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={handleRunHealthCheck}
              disabled={healthCheckRunning}
              style={{
                background: "#f97316",
                border: "none",
                color: "#000",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: healthCheckRunning ? "not-allowed" : "pointer",
                opacity: healthCheckRunning ? 0.5 : 1,
              }}
            >
              {healthCheckRunning ? "Running..." : "Run Health Check"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px", maxWidth: "1600px", margin: "0 auto" }}>
        {/* Platform KPIs */}
        {adminData && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <KPICard title="Total Restaurants" value={adminData.platform.totalRestaurants} />
              <KPICard title="Active Restaurants" value={adminData.platform.activeRestaurants} subtitle="Last 7 days" />
              <KPICard title="New This Week" value={adminData.platform.newThisWeek} />
              <KPICard title="Total Orders" value={adminData.platform.totalOrders.toLocaleString()} />
              <KPICard title="Total Revenue" value={`₹${formatRevenue(adminData.platform.totalRevenue)}`} />
              <KPICard title="Total Customers" value={adminData.platform.totalCustomers.toLocaleString()} />
            </div>

            {/* System Health */}
            <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>System Health</h2>
              {adminData.health.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
                  Click Run Health Check to populate
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                        <th style={{ textAlign: "left", padding: "8px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>Endpoint</th>
                        <th style={{ textAlign: "center", padding: "8px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>Status</th>
                        <th style={{ textAlign: "right", padding: "8px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>Uptime %</th>
                        <th style={{ textAlign: "right", padding: "8px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>Avg Response</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminData.health.map((h) => (
                        <tr key={h.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "12px 8px", color: "#fff" }}>{h.name}</td>
                          <td style={{ padding: "12px 8px", textAlign: "center" }}>
                            {h.ok ? (
                              <span style={{ color: "#10b981", fontSize: "16px" }}>✓</span>
                            ) : (
                              <span style={{ color: "#ef4444", fontSize: "16px" }}>✗</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 8px", textAlign: "right", color: "rgba(255,255,255,0.7)" }}>
                            {h.uptime}%
                          </td>
                          <td style={{ padding: "12px 8px", textAlign: "right", color: "rgba(255,255,255,0.7)" }}>
                            {h.lastMs}ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Daily Trend Chart */}
            {adminData.dailyTrend.length > 0 && (
              <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
                  Daily Orders — Last 14 Days
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={adminData.dailyTrend}>
                    <defs>
                      <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => format(new Date(val), "MMM d")}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 12px", borderRadius: "8px", fontSize: "12px" }}>
                            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>
                              {format(new Date(payload[0].payload.date), "MMM d, yyyy")}
                            </p>
                            <p style={{ color: "#fff", fontWeight: "600" }}>
                              {payload[0].value} orders
                            </p>
                          </div>
                        );
                      }}
                      cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
                    />
                    <Area
                      dataKey="orders"
                      stroke="#f97316"
                      strokeWidth={2}
                      fill="url(#ordersGrad)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* All Restaurants Table */}
            <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
                All Restaurants ({adminData.restaurants.length})
              </h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      <th style={{ textAlign: "left", padding: "8px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>Restaurant</th>
                      <th style={{ textAlign: "left", padding: "8px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>Location</th>
                      <th style={{ textAlign: "center", padding: "8px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>Tables</th>
                      <th style={{ textAlign: "center", padding: "8px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>Menu Items</th>
                      <th style={{ textAlign: "center", padding: "8px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>Staff</th>
                      <th style={{ textAlign: "right", padding: "8px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>Total Orders</th>
                      <th style={{ textAlign: "right", padding: "8px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>Revenue (Month)</th>
                      <th style={{ textAlign: "right", padding: "8px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>Orders Today</th>
                      <th style={{ textAlign: "left", padding: "8px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>Last Order</th>
                      <th style={{ textAlign: "center", padding: "8px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData.restaurants.map((r) => (
                      <tr
                        key={r.id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td style={{ padding: "12px 8px", color: "#fff", fontWeight: "500" }}>{r.name}</td>
                        <td style={{ padding: "12px 8px", color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>
                          {r.address}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "center", color: "rgba(255,255,255,0.7)" }}>
                          {r.tables}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "center", color: "rgba(255,255,255,0.7)" }}>
                          {r.menuItems}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "center", color: "rgba(255,255,255,0.7)" }}>
                          {r.staff}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "right", color: "rgba(255,255,255,0.7)" }}>
                          {r.totalOrders}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "right", color: "rgba(255,255,255,0.7)" }}>
                          ₹{formatRevenue(r.revenueThisMonth)}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "right", color: "rgba(255,255,255,0.7)" }}>
                          {r.ordersToday}
                        </td>
                        <td style={{ padding: "12px 8px", color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                          {r.lastOrderAt ? format(new Date(r.lastOrderAt), "MMM d, HH:mm") : "—"}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "600",
                              background: r.isActive ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                              color: r.isActive ? "#10b981" : "rgba(255,255,255,0.4)",
                            }}
                          >
                            {r.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Signups */}
            {adminData.recentSignups.length > 0 && (
              <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
                  Recent Signups (Last 7 Days)
                </h2>
                <div style={{ display: "grid", gap: "12px" }}>
                  {adminData.recentSignups.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div>
                        <p style={{ color: "#fff", fontWeight: "500", fontSize: "14px" }}>{s.name}</p>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "2px" }}>
                          {s.phone}
                        </p>
                      </div>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                        {format(new Date(s.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Sources */}
            {adminData.orderSources.length > 0 && (
              <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
                  Order Sources
                </h2>
                <div style={{ display: "grid", gap: "8px" }}>
                  {adminData.orderSources.map((os) => (
                    <div
                      key={os.source}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "6px",
                      }}
                    >
                      <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>
                        {os.source}
                      </span>
                      <span style={{ color: "#fff", fontWeight: "600", fontSize: "13px" }}>
                        {os._count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function KPICard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px" }}>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginBottom: "8px", fontWeight: "500" }}>
        {title}
      </p>
      <p style={{ color: "#fff", fontSize: "28px", fontWeight: "700", marginBottom: subtitle ? "4px" : "0" }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{subtitle}</p>
      )}
    </div>
  );
}

function formatRevenue(amount: number): string {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toFixed(0);
}
