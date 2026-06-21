"use client";
import dynamic from "next/dynamic";

const DashboardChartsLazy = dynamic(
  () => import("./charts").then((m) => ({ default: m.DashboardCharts })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg bg-[#111] border border-white/[0.07] h-[232px] animate-pulse" />
    ),
  }
);

export function DashboardCharts(
  props: { weeklyData: { day: string; revenue: number; orders: number }[] }
) {
  return <DashboardChartsLazy {...props} />;
}
