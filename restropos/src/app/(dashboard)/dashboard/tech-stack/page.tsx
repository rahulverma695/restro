"use client";

import { useState, useEffect, useRef } from "react";
import {
  Terminal, Database, Server, Code2, ShieldCheck, Check,
  Play, RefreshCw, Cpu, Activity, ArrowRight, TerminalSquare
} from "lucide-react";

export default function TechStackDashboard() {
  const [techLogs, setTechLogs] = useState<string[]>([]);
  const [isTechCompiling, setIsTechCompiling] = useState(false);
  const [techTab, setTechTab] = useState<"infra" | "logs">("infra");
  const techContainerRef = useRef<HTMLDivElement>(null);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (techContainerRef.current) {
      techContainerRef.current.scrollTop = techContainerRef.current.scrollHeight;
    }
  }, [techLogs]);

  const handleTechCompile = () => {
    setIsTechCompiling(true);
    setTechLogs([]);
    setTechTab("logs");

    const lines = [
      `$ anvil compile --target=restropos-framework --env=production`,
      `[1/4] Running Next.js compilation triggers...`,
      `✓ Bundle compiled: 124 static edge endpoints verified.`,
      `[2/4] Parsing Postgres dynamic schemas & index keys...`,
      `✓ Prisma client sync: Database connection active.`,
      `[3/4] Deploying schema migrations to Neon PostgreSQL cluster...`,
      `✓ Migrations synced: 0ms downtime edge schema swap.`,
      `[4/4] Verifying universal printing webhook listeners...`,
      `✓ Escaped thermal routing online (ESC/POS routing verified).`,
      `✓ Core engine version check: restropos-core v2.4`,
      `✓ SUCCESS: RestroPOS flagship build compiled clean.`
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setTechLogs(prev => [...prev, lines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setIsTechCompiling(false);
      }
    }, 4000 / lines.length);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px] text-white/95">
      {/* Header */}
      <div>
        <h1 className="text-[20px] font-semibold text-white/90 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-orange-500" />
          Tech Stack & System Infrastructure
        </h1>
        <p className="text-[12px] text-white/35 mt-1">
          Verify compiling status, serverless database clusters, and code repository details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Compile terminal logs */}
        <div className="lg:col-span-2 rounded-lg bg-[#111] border border-white/[0.07] overflow-hidden flex flex-col min-h-[480px]">
          
          {/* Terminal header */}
          <div className="px-4 py-3 border-b border-white/[0.06] bg-[#161616] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TerminalSquare className="w-4 h-4 text-orange-500" />
              <span className="text-[13px] font-semibold text-white/80">Anvil Compiler Terminal</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setTechTab("infra")}
                className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                  techTab === "infra"
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                System Specs
              </button>
              <button
                onClick={() => setTechTab("logs")}
                className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                  techTab === "logs"
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                Compile Logs
              </button>
            </div>
          </div>

          {/* Terminal content */}
          <div className="flex-1 p-5 font-mono text-xs flex flex-col justify-between bg-[#0b0b0b]">
            {techTab === "logs" ? (
              <div 
                ref={techContainerRef}
                className="overflow-y-auto max-h-[360px] space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10"
              >
                {techLogs.length === 0 ? (
                  <div className="text-white/30 italic py-10 text-center">
                    Compiler idle. Click "Trigger Compiler Build Test" below to run simulated tests.
                  </div>
                ) : (
                  techLogs.map((log, idx) => {
                    const isCmd = log.startsWith("$");
                    const isSuccess = log.includes("SUCCESS") || log.includes("✓");
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          color: isCmd ? "#f97316" : isSuccess ? "#4ade80" : "#a8a29e",
                          fontWeight: isCmd || isSuccess ? 700 : 400
                        }}
                        className="leading-relaxed whitespace-pre-wrap"
                      >
                        {log}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center gap-2 text-orange-400 font-semibold mb-2">
                      <Cpu className="w-4 h-4" />
                      <span>Next.js Framework</span>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed">
                      Flagship React framework deployed globally on edge servers. Instant page transitions, server-side rendering, and high-performance caching.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                      <Database className="w-4 h-4" />
                      <span>PostgreSQL DB</span>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed">
                      Neon Serverless PostgreSQL database. Complete sovereign administrative database access. Autoscale connection pools with zero idle costs.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
                      <Server className="w-4 h-4" />
                      <span>Edge Hosting</span>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed">
                      Deployed straight to Vercel edge networks under your company name. Zero middleman markup, running on raw infrastructure free-tiers.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center gap-2 text-purple-400 font-semibold mb-2">
                      <Activity className="w-4 h-4" />
                      <span>Offline Sync Engine</span>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed">
                      Local SQLite caching systems synchronize counter terminal bills over local LAN sync loops if cloud internet connections cut out.
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* Terminal footer actions */}
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
              <span className="text-[10px] text-white/30 font-mono">
                Compiler Target: restropos-production-v1
              </span>
              <button
                onClick={handleTechCompile}
                disabled={isTechCompiling}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-md text-[12px] font-semibold flex items-center gap-2 transition-colors"
              >
                {isTechCompiling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Compiling...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Trigger Compiler Build Test
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Right column: Infrastructure & Status */}
        <div className="rounded-lg bg-[#111] border border-white/[0.07] p-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b border-white/[0.06] pb-3">
              <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">System Deployment Status</span>
              <h2 className="text-[14px] font-semibold text-white/90 mt-1">Infrastructure & Status Dashboard</h2>
            </div>

            <div className="space-y-4">
              
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] p-3 rounded-lg">
                <Code2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Core Engine Version</div>
                  <div className="text-[11.5px] font-mono text-white/80 truncate mt-0.5">RestroPOS Core v2.4</div>
                </div>
                <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0">
                  Stable
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] p-3 rounded-lg">
                <Database className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider">PostgreSQL DB Cluster</div>
                  <div className="text-[11.5px] font-mono text-white/80 truncate mt-0.5">Neon Serverless DB</div>
                </div>
                <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0">
                  Sovereign
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] p-3 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Active Subscription</div>
                  <div className="text-[11.5px] font-bold text-green-400 mt-0.5">₹14,999 / year Flat Rate</div>
                </div>
                <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0">
                  Active
                </span>
              </div>

            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-4 mt-6">
            <p className="text-[11px] text-white/30 leading-relaxed">
              * RestroPOS runs on a managed tenant-isolated architecture. Your subscription includes all cloud hosting resources and automated backups.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
