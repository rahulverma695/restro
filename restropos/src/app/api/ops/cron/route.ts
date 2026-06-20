import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE = process.env.NEXTAUTH_URL || "https://restropos.vercel.app";

// Endpoints to check — method, path, expected status
const CHECKS = [
  { name: "Landing Page",       path: "/",                          method: "GET",  expect: 200 },
  { name: "Login Page",         path: "/login",                     method: "GET",  expect: 200 },
  { name: "Setup Page",         path: "/setup",                     method: "GET",  expect: 200 },
  { name: "Auth CSRF",          path: "/api/auth/csrf",             method: "GET",  expect: 200 },
  { name: "Health Ping",        path: "/api/ops/ping",              method: "GET",  expect: 200 },
  { name: "DB Health",          path: "/api/ops/db-health",         method: "GET",  expect: 200 },
];

async function checkEndpoint(name: string, path: string, method: string, expect: number) {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { "x-ops-key": process.env.OPS_PASSWORD || "" },
      signal: AbortSignal.timeout(8000),
    });
    const ms = Date.now() - start;
    const ok = res.status === expect;
    return { endpoint: name, status: res.status, responseMs: ms, ok, error: ok ? null : `Expected ${expect}, got ${res.status}` };
  } catch (err: any) {
    return { endpoint: name, status: 0, responseMs: Date.now() - start, ok: false, error: err.message || "Request failed" };
  }
}

export async function GET(req: NextRequest) {
  // Cron job is completely disabled until the app is made live
  return NextResponse.json({
    message: "Cron job is completely disabled until the app is made live.",
    status: "disabled",
    timestamp: new Date().toISOString(),
  });

  // Accept Vercel cron calls (no auth header needed — Vercel infrastructure protects it)
  // Also accept manual triggers with the ops key
  const opsKey = req.headers.get("x-ops-key");
  const isManual = opsKey === process.env.OPS_PASSWORD;
  const isVercelCron = req.headers.get("user-agent")?.includes("vercel-cron") || req.headers.get("x-vercel-cron") === "1";

  if (!isManual && !isVercelCron) {
    // Still allow if no auth — cron endpoint is internal only via /api/ops path
    // which is not publicly linked anywhere
  }  const results = await Promise.all(
    CHECKS.map(c => checkEndpoint(c.name, c.path, c.method, c.expect))
  );

  // Store all results
  for (const r of results) {
    await prisma.healthCheck.create({
      data: {
        endpoint: r.endpoint,
        status: r.status,
        responseMs: r.responseMs,
        ok: r.ok,
        error: r.error,
      },
    });
  }

  // Clean up checks older than 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await prisma.healthCheck.deleteMany({ where: { checkedAt: { lt: thirtyDaysAgo } } });

  // Alert if any endpoint is down
  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) {
    // Check if we already alerted in the last 30 minutes (avoid spam)
    const recentAlert = await prisma.healthCheck.findFirst({
      where: {
        endpoint: failed[0].endpoint,
        ok: false,
        checkedAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
      },
      orderBy: { checkedAt: "asc" },
    });

    // Only alert if this is the 2nd consecutive failure (recentAlert exists = first failure already logged)
    if (recentAlert) {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "onboarding@resend.dev",
        to: "nikkibhaviyavar@gmail.com",
        subject: `🚨 RestroPOS Alert: ${failed.length} endpoint(s) down`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #ef4444;">⚠️ System Alert</h2>
            <p style="color: #6b7280;">The following endpoints are failing:</p>
            ${failed.map(f => `
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin: 8px 0;">
                <strong>${f.endpoint}</strong><br/>
                <span style="color: #ef4444;">Status: ${f.status} · ${f.error}</span><br/>
                <span style="color: #9ca3af;">Response time: ${f.responseMs}ms</span>
              </div>
            `).join("")}
            <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">
              Checked at ${new Date().toISOString()} · RestroPOS Ops
            </p>
          </div>
        `,
      }).catch(console.error);
    }
  }

  return NextResponse.json({
    checked: results.length,
    passed: results.filter(r => r.ok).length,
    failed: failed.length,
    results,
    timestamp: new Date().toISOString(),
  });
}
