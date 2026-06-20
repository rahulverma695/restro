"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 px-3 py-2 rounded-lg text-xs shadow-xl">
      <p className="text-white/50 mb-1">{label}</p>
      <p className="text-white font-semibold">₹{Number(payload[0]?.value || 0).toFixed(0)}</p>
    </div>
  );
}

export function DashboardCharts({ weeklyData }: { weeklyData: { day: string; revenue: number; orders: number }[] }) {
  return (
    <div className="rounded-lg bg-[#111] border border-white/[0.07]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="text-[13px] font-semibold text-white/80">Revenue — Last 7 Days</span>
        {weeklyData.length > 0 && (
          <span className="text-[11px] text-white/30 tabular">
            ₹{weeklyData.reduce((s,d) => s + d.revenue, 0).toFixed(0)} total
          </span>
        )}
      </div>
      <div className="p-4">
        {weeklyData.length === 0 ? (
          <div className="h-[160px] flex items-center justify-center text-[12px] text-white/20">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} width={45} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
              <Area dataKey="revenue" stroke="#f97316" strokeWidth={1.5} fill="url(#grad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
