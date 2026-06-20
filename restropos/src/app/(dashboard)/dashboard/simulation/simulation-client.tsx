"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, RefreshCw, Trash2, Table2, 
  DollarSign, ShoppingBag, Activity, Server, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

type TableData = {
  id: string;
  number: string;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING";
  // Simulation specific local states
  simState: "AVAILABLE" | "SEATED" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "DINING" | "BILL_REQUESTED" | "BILL_SETTLED" | "CLEANING";
  activeOrderId?: string;
  activeOrderNo?: string;
  guestsCount?: number;
  itemsList?: string;
  currentBill?: number;
  elapsedSeconds: number;
  totalDuration: number; // Duration target for current state
};

export function SimulationClient({
  initialTables,
  menuItems,
  restaurantId,
  userId
}: {
  initialTables: any[];
  menuItems: any[];
  restaurantId: string;
  userId: string;
}) {
  const router = useRouter();
  const [tables, setTables] = useState<TableData[]>([]);
  const [logs, setLogs] = useState<{ id: string; time: string; msg: string; type: "info" | "success" | "warn" | "error" }[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [speed, setSpeed] = useState<1 | 5 | 20>(5); // 1x, 5x, 20x fast-forward
  const [seeding, setSeeding] = useState(false);
  const [purging, setPurging] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    ordersPlaced: 0,
    totalRevenue: 0,
    kotProcessed: 0,
    activeTables: 0,
  });

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Sync prop tables to local state
  useEffect(() => {
    setTables(
      initialTables.map(t => ({
        id: t.id,
        number: t.number,
        capacity: t.capacity,
        status: t.status,
        simState: t.status === "OCCUPIED" ? "DINING" : (t.status as any),
        elapsedSeconds: 0,
        totalDuration: getRandomDuration("AVAILABLE"),
      }))
    );
    addLog("System initialized. Ready to begin load simulation.", "info");
  }, [initialTables]);

  // Keep logs scrolled down
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Helper to add logs
  function addLog(msg: string, type: "info" | "success" | "warn" | "error" = "info") {
    const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setLogs(prev => [...prev, { id: Math.random().toString(), time, msg, type }].slice(-50)); // Keep last 50
  }

  // Get duration targets based on speed
  function getRandomDuration(state: string): number {
    let baseRange = [10, 20]; // seconds
    switch (state) {
      case "AVAILABLE": baseRange = [15, 30]; break;
      case "SEATED": baseRange = [5, 10]; break;
      case "CONFIRMED": baseRange = [5, 10]; break;
      case "PREPARING": baseRange = [15, 25]; break;
      case "READY": baseRange = [5, 10]; break;
      case "DINING": baseRange = [20, 40]; break;
      case "BILL_REQUESTED": baseRange = [5, 10]; break;
      case "CLEANING": baseRange = [6, 12]; break;
    }
    const secs = Math.floor(Math.random() * (baseRange[1] - baseRange[0] + 1)) + baseRange[0];
    return secs;
  }

  // Environment setup (Seed)
  async function handleSeed() {
    setSeeding(true);
    addLog("Initializing environment: Seeding categories, menu items, and 10 tables...", "warn");
    try {
      const res = await fetch("/api/ops/simulate-seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      });
      if (res.ok) {
        addLog("Simulation environment successfully seeded!", "success");
        router.refresh();
      } else {
        addLog("Failed to seed simulation environment.", "error");
      }
    } catch (e) {
      addLog("Network error during environment setup.", "error");
    } finally {
      setSeeding(false);
    }
  }

  // Environment Purge (Delete Simulation Orders)
  async function handlePurge() {
    setPurging(true);
    setIsSimulating(false);
    addLog("Clearing database: Purging simulation orders and resetting tables...", "warn");
    try {
      const res = await fetch("/api/ops/simulate-seed", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      });
      if (res.ok) {
        const data = await res.json();
        addLog(`Database cleared! Deleted ${data.count} simulation orders and payments. All tables reset to AVAILABLE.`, "success");
        setStats({ ordersPlaced: 0, totalRevenue: 0, kotProcessed: 0, activeTables: 0 });
        router.refresh();
      } else {
        addLog("Failed to purge simulation orders.", "error");
      }
    } catch (e) {
      addLog("Network error during database cleanup.", "error");
    } finally {
      setPurging(false);
    }
  }

  // Pick random menu items for order
  function selectRandomItems() {
    if (menuItems.length === 0) return [];
    const count = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
    const selected: any[] = [];
    const itemsCopy = [...menuItems];
    for (let i = 0; i < count; i++) {
      if (itemsCopy.length === 0) break;
      const idx = Math.floor(Math.random() * itemsCopy.length);
      const chosen = itemsCopy.splice(idx, 1)[0];
      selected.push({
        menuItemId: chosen.id,
        name: chosen.name,
        quantity: Math.floor(Math.random() * 2) + 1, // 1 or 2 qty
        price: chosen.price,
      });
    }
    return selected;
  }

  // Run the Simulation Timer Ticks
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(async () => {
      // Process tick
      setTables(prevTables => {
        const updated = prevTables.map(t => {
          const elapsed = t.elapsedSeconds + speed;
          if (elapsed >= t.totalDuration) {
            // Trigger transition
            handleTableTransition(t);
            return {
              ...t,
              elapsedSeconds: 0,
              totalDuration: getRandomDuration(getNextState(t.simState)),
              simState: getNextState(t.simState),
            };
          }
          return { ...t, elapsedSeconds: elapsed };
        });

        // Recalculate stats
        const active = updated.filter(t => t.simState !== "AVAILABLE" && t.simState !== "CLEANING").length;
        setStats(s => ({ ...s, activeTables: active }));

        return updated;
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, speed, menuItems]);

  // Map state flow
  function getNextState(current: string): any {
    switch (current) {
      case "AVAILABLE": return "SEATED";
      case "SEATED": return "CONFIRMED";
      case "CONFIRMED": return "PREPARING";
      case "PREPARING": return "READY";
      case "READY": return "SERVED";
      case "SERVED": return "DINING";
      case "DINING": return "BILL_REQUESTED";
      case "BILL_REQUESTED": return "CLEANING";
      case "CLEANING": return "AVAILABLE";
      default: return "AVAILABLE";
    }
  }

  // Handle API triggers and logs on transitions
  async function handleTableTransition(table: TableData) {
    const next = getNextState(table.simState);

    switch (next) {
      case "SEATED": {
        const guests = Math.floor(Math.random() * (table.capacity - 1)) + 2; // 2 to capacity guests
        table.guestsCount = guests;
        addLog(`Table ${table.number}: ${guests} guests arrived & seated.`, "info");
        break;
      }
      case "CONFIRMED": {
        // Place real order
        const items = selectRandomItems();
        if (items.length === 0) return;

        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const taxRate = 5.0; // 5% tax
        const taxAmount = Math.round(subtotal * (taxRate / 100));
        const total = subtotal + taxAmount;

        table.currentBill = total;
        table.itemsList = items.map(i => `${i.quantity}x ${i.name}`).join(", ");

        addLog(`Table ${table.number}: Placing order for [${table.itemsList}] (Total: ₹${total})...`, "info");

        try {
          const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restaurantId,
              userId,
              orderType: "DINE_IN",
              tableId: table.id,
              items: items,
              discount: 0,
              paymentMethod: "UPI",
              subtotal,
              taxAmount,
              total,
              notes: "Simulation Load Test",
            }),
          });

          if (res.ok) {
            const data = await res.json();
            table.activeOrderId = data.orderId;
            // Generate order no mockup
            table.activeOrderNo = `SIM-${Math.floor(100 + Math.random() * 900)}`;
            addLog(`Table ${table.number}: Order created successfully (ID: ${table.activeOrderId}). KOT fired to kitchen.`, "success");
            setStats(s => ({ ...s, ordersPlaced: s.ordersPlaced + 1 }));
          } else {
            addLog(`Table ${table.number}: Failed to create order in database.`, "error");
          }
        } catch (e) {
          addLog(`Table ${table.number}: Network error while placing order.`, "error");
        }
        break;
      }
      case "PREPARING": {
        if (!table.activeOrderId) return;
        addLog(`Kitchen: Received order for Table ${table.number}. Chef started prep.`, "info");
        try {
          await fetch(`/api/orders/${table.activeOrderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "PREPARING" }),
          });
          setStats(s => ({ ...s, kotProcessed: s.kotProcessed + 1 }));
        } catch (e) {}
        break;
      }
      case "READY": {
        if (!table.activeOrderId) return;
        addLog(`Kitchen: Order for Table ${table.number} is READY. Kitchen bell rung.`, "success");
        try {
          await fetch(`/api/orders/${table.activeOrderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "READY" }),
          });
        } catch (e) {}
        break;
      }
      case "SERVED": {
        if (!table.activeOrderId) return;
        addLog(`Table ${table.number}: Captain served the order. Guests started dining.`, "info");
        try {
          await fetch(`/api/orders/${table.activeOrderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "SERVED" }),
          });
        } catch (e) {}
        break;
      }
      case "BILL_REQUESTED": {
        addLog(`Table ${table.number}: Dining completed. Guests requested the bill (₹${table.currentBill}).`, "warn");
        break;
      }
      case "CLEANING": {
        if (!table.activeOrderId) return;
        const methods: ("UPI" | "CASH" | "CARD")[] = ["UPI", "CASH", "CARD"];
        const method = methods[Math.floor(Math.random() * methods.length)];
        addLog(`Table ${table.number}: Bill settled via ${method}. Paid ₹${table.currentBill}. Resetting table...`, "success");
        
        try {
          // Set to COMPLETED which releases the table in DB
          await fetch(`/api/orders/${table.activeOrderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "COMPLETED" }),
          });
          setStats(s => ({ ...s, totalRevenue: s.totalRevenue + (table.currentBill || 0) }));
          
          // Clear active fields
          table.activeOrderId = undefined;
          table.activeOrderNo = undefined;
          table.itemsList = undefined;
          table.currentBill = undefined;
          table.guestsCount = undefined;
        } catch (e) {}
        break;
      }
      case "AVAILABLE": {
        addLog(`Table ${table.number}: Table cleared and sanitized. Status: AVAILABLE.`, "info");
        break;
      }
    }
  }

  // Rendering Helper for Status Badges
  function getSimStateBadge(state: string) {
    const config: Record<string, { label: string; bg: string; text: string }> = {
      AVAILABLE: { label: "Available", bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400" },
      SEATED: { label: "Seated", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400" },
      CONFIRMED: { label: "KOT Placed", bg: "bg-cyan-500/10 border-cyan-500/20", text: "text-cyan-400" },
      PREPARING: { label: "Prepping", bg: "bg-orange-500/10 border-orange-500/20", text: "text-orange-400" },
      READY: { label: "Food Ready", bg: "bg-pink-500/10 border-pink-500/20", text: "text-pink-400" },
      SERVED: { label: "Served", bg: "bg-indigo-500/10 border-indigo-500/20", text: "text-indigo-400" },
      DINING: { label: "Dining", bg: "bg-violet-500/10 border-violet-500/20", text: "text-violet-400" },
      BILL_REQUESTED: { label: "Paying", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
      CLEANING: { label: "Cleaning", bg: "bg-neutral-500/10 border-neutral-500/20", text: "text-neutral-400" },
    };

    const cfg = config[state] || config.AVAILABLE;
    return (
      <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold tracking-wide ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
    );
  }

  if (initialTables.length === 0) {
    return (
      <div className="p-5 max-w-[900px] mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-orange-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-[20px] font-bold text-white">Simulation Setup Required</h2>
          <p className="text-[13px] text-white/40 max-w-md mx-auto">
            To begin testing under load, we need to seed the restaurant environment with categories, menu items, and 10 default dining tables.
          </p>
        </div>
        <Button onClick={handleSeed} disabled={seeding} className="px-6 py-5 rounded-full font-semibold">
          {seeding ? "Setting up tables & menu..." : "Initialize Simulation Environment"}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5 max-w-[1300px]">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[18px] font-semibold text-white/90">Load Simulator</h1>
          <p className="text-[12px] text-white/30 mt-0.5">Stress testing the live POS &amp; Order pipelines</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <div className="flex bg-[#111] border border-white/[0.07] rounded-lg p-1 text-[11px] font-semibold">
            {([1, 5, 20] as const).map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1.5 rounded-md transition-colors ${speed === s ? "bg-orange-500 text-black" : "text-white/45 hover:text-white/80"}`}
              >
                {s}x {s === 1 ? "(Real)" : s === 5 ? "(Medium)" : "(Turbo)"}
              </button>
            ))}
          </div>

          <Button
            onClick={() => setIsSimulating(!isSimulating)}
            variant={isSimulating ? "destructive" : "default"}
            size="sm"
            className="rounded-lg px-4"
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5 mr-1.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1.5" /> Start Simulation
              </>
            )}
          </Button>

          <Button
            onClick={handlePurge}
            variant="outline"
            size="sm"
            disabled={purging}
            className="border-white/[0.07] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg px-4"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> 
            {purging ? "Purging..." : "Purge Test Data"}
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Simulated Tables", value: `${stats.activeTables} / 10`, icon: Table2, accent: "#3b82f6" },
          { label: "Real Orders Created", value: stats.ordersPlaced, icon: ShoppingBag, accent: "#10b981" },
          { label: "Database KOT Updates", value: stats.kotProcessed, icon: Activity, accent: "#8b5cf6" },
          { label: "Simulated Sales Value", value: formatCurrency(stats.totalRevenue), icon: DollarSign, accent: "#f97316" }
        ].map(kpi => (
          <div key={kpi.label} className="rounded-lg bg-[#111] border border-white/[0.07] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-white/40 uppercase tracking-wide font-medium">{kpi.label}</span>
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: kpi.accent + "18" }}>
                <kpi.icon className="w-3.5 h-3.5" style={{ color: kpi.accent }} />
              </div>
            </div>
            <p className="text-[22px] font-semibold text-white/90 tabular leading-none">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Tables Floor Map */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">Main Dining Hall</span>
            <div className="flex-1 h-px bg-white/[0.05]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {tables.map(table => {
              const isOccupied = table.simState !== "AVAILABLE" && table.simState !== "CLEANING";
              return (
                <div 
                  key={table.id}
                  className={`rounded-lg border p-3.5 transition-all flex flex-col justify-between h-[155px] ${
                    isOccupied ? "bg-orange-500/5 border-orange-500/25" : "bg-[#111] border-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[15px] font-bold text-white/80">{table.number}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{table.capacity} seats</p>
                    </div>
                    {getSimStateBadge(table.simState)}
                  </div>

                  <div className="my-2.5 flex-1 flex flex-col justify-center">
                    {isOccupied ? (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-white/30">{table.guestsCount} guests seated</span>
                          <span className="text-orange-400 font-bold tabular">₹{table.currentBill}</span>
                        </div>
                        <p className="text-[10.5px] font-medium text-white/70 line-clamp-2 leading-tight">
                          {table.itemsList}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-white/20 italic">Table is clean &amp; ready</p>
                    )}
                  </div>

                  {/* Progress bar */}
                  {isOccupied && (
                    <div className="w-full space-y-1">
                      <div className="w-full bg-white/[0.04] h-1 rounded overflow-hidden">
                        <div 
                          className="bg-orange-500 h-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, (table.elapsedSeconds / table.totalDuration) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Simulator Logs / Terminal */}
        <div className="flex flex-col h-[525px] rounded-lg bg-[#0c0c0c] border border-white/[0.07] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#111]">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[13px] font-semibold text-white/80">Simulation Logs</span>
            </div>
            {isSimulating && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
            )}
          </div>

          <div 
            ref={logContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-2.5 font-mono text-[11px] leading-relaxed"
          >
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/20 italic">
                Logs will populate here as the simulation runs.
              </div>
            ) : (
              logs.map(log => {
                const color = {
                  info: "text-white/45",
                  success: "text-emerald-400",
                  warn: "text-amber-400 font-medium",
                  error: "text-rose-500 font-bold"
                }[log.type];

                return (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-white/25 flex-shrink-0">[{log.time}]</span>
                    <span className={color}>{log.msg}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
