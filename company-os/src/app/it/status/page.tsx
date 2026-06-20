'use client';

import React from 'react';
import { useAppState } from '@/context/StateContext';
import { Activity, ShieldAlert, Cpu, Database, Cloud } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface ServiceStatus {
  name: string;
  category: string;
  icon: any;
  uptime: string;
  latency: number;
  status: 'operational' | 'degraded' | 'major_outage';
}

const services: ServiceStatus[] = [
  { name: 'Identity Provider oauth2', category: 'Auth Server', icon: Cpu, uptime: '99.99%', latency: 24, status: 'operational' },
  { name: 'PostgreSQL Relational DB Node', category: 'Database Cluster', icon: Database, uptime: '99.95%', latency: 12, status: 'operational' },
  { name: 'PWA Vercel CDN Cache', category: 'Edge Cache', icon: Cloud, uptime: '100.00%', latency: 8, status: 'operational' },
  { name: 'Internal Wiki Assets S3 Store', category: 'Asset Storage', icon: Cloud, uptime: '99.90%', latency: 110, status: 'degraded' },
];

const latencyHist = [12, 14, 18, 15, 12, 11, 9, 8, 12, 14, 15, 18, 24, 32, 28, 14, 12, 11, 10, 12, 14, 16, 12, 8];

export default function SystemStatusPage() {
  const { activeUser } = useAppState();

  // Access check
  if (activeUser.role !== 'SuperAdmin' && activeUser.role !== 'Manager' && activeUser.role !== 'Employee') {
    return <AccessDenied suite="IT & Service" role={activeUser.role} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div className="border-b border-[#E2E1DD] pb-4">
        <h2 className="text-3xl font-extrabold text-black tracking-tight flex items-center gap-3">
          <Activity className="h-8 w-8 text-[#FF3E3E] shadow-[0_0_15px_rgba(255,62,62,0.2)] animate-pulse" />
          System Status
        </h2>
        <p className="text-sm text-[#5E6258] mt-1">Monitor server latencies, cloud uptime indices, and network hardware node statuses.</p>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Services lists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E2E1DD] border border-[#E2E1DD] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">Operational Node Monitors</h3>
            
            <div className="space-y-4">
              {services.map((srv, idx) => {
                let badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                let label = 'Operational';
                if (srv.status === 'degraded') {
                  badgeColor = 'bg-black hover:bg-black/90/10 text-black border border-amber-400/20';
                  label = 'Degraded Performance';
                }
                const SrvIcon = srv.icon;

                return (
                  <div key={idx} className="bg-[#FAF9F6] border border-[#E2E1DD]/80 rounded-xl p-4 flex items-center justify-between transition-all hover:border-[#FF3E3E]/30">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-[#FAF9F6] border border-[#E2E1DD] rounded-lg flex items-center justify-center text-[#5E6258]">
                        <SrvIcon className="h-4.5 w-4.5 text-[#00E5FF]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-black leading-tight">{srv.name}</h4>
                        <span className="text-[8px] text-[#5E6258] font-extrabold uppercase mt-0.5">{srv.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-right">
                      <div>
                        <p className="text-[9px] text-[#5E6258] uppercase font-bold tracking-wider">Latency</p>
                        <p className="text-black font-extrabold">{srv.latency}ms</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-[#5E6258] uppercase font-bold tracking-wider">Uptime</p>
                        <p className="text-black font-extrabold">{srv.uptime}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${badgeColor}`}>
                        {label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Visual Latency Chart & logs */}
        <div className="space-y-6">
          
          {/* Latency History */}
          <div className="bg-white border border-[#E2E1DD] border border-[#E2E1DD] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">24h Network Ping Latency</h3>
            
            {/* Mock bar chart */}
            <div className="h-28 flex items-end gap-1.5 border-b border-[#E2E1DD] pb-2">
              {latencyHist.map((val, idx) => {
                const percent = Math.min(100, (val / 35) * 100);
                let barColor = 'bg-black hover:bg-black/90/70 hover:bg-black hover:bg-black/90';
                if (val > 30) {
                  barColor = 'bg-[#FF3E3E]/70 hover:bg-[#FF3E3E]';
                }
                return (
                  <div 
                    key={idx} 
                    className={`flex-1 ${barColor} rounded-t-sm transition-all duration-300`} 
                    style={{ height: `${percent}%` }}
                    title={`${val}ms latency`}
                  />
                );
              })}
            </div>
            
            <div className="flex justify-between items-center text-[9px] font-bold text-[#5E6258] uppercase">
              <span>24 Hours Ago</span>
              <span>Active Node Response: 12ms</span>
              <span>Now</span>
            </div>
          </div>

          {/* Incident Log */}
          <div className="bg-white border border-[#E2E1DD] border border-[#E2E1DD] rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">Incident Log</h3>
            <div className="space-y-2.5">
              <div className="border-l-2 border-amber-400 pl-3 py-0.5 space-y-0.5">
                <p className="text-xs font-bold text-black leading-tight">Wiki AWS S3 Degraded IOPS</p>
                <p className="text-[9px] text-[#5E6258]">Scheduled maintenance review on S3 cluster - June 14, 18:22</p>
              </div>
              <div className="border-l-2 border-emerald-500 pl-3 py-0.5 space-y-0.5">
                <p className="text-xs font-bold text-black leading-tight">Database Router Sync Restored</p>
                <p className="text-[9px] text-[#5E6258]">Failover backup cluster switched back to main - June 12, 10:14</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
