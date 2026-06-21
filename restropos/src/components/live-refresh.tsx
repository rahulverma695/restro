"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };

    // Immediate refresh when tab becomes visible after being hidden
    document.addEventListener("visibilitychange", refresh);

    const interval = setInterval(refresh, intervalMs);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, intervalMs]);

  return null;
}
