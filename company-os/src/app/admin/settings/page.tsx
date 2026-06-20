'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { ShieldAlert, Settings, Save, Server, Shield, HardDrive } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function AdminSettingsPage() {
  const { activeUser } = useAppState();
  
  // Settings Form States
  const [smtpServer, setSmtpServer] = useState('smtp.sendgrid.net');
  const [smtpPort, setSmtpPort] = useState('587');
  const [pwaMode, setPwaMode] = useState('offline-first');
  const [dbBackup, setDbBackup] = useState('daily');
  const [securityLevel, setSecurityLevel] = useState('strict');

  // SuperAdmin check
  if (activeUser.role !== 'SuperAdmin') {
    return <AccessDenied suite="Command Center" role={activeUser.role} />;
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings committed to mock PWA local storage successfully!');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div className="border-b border-[#E2E1DD] pb-4">
        <h2 className="text-3xl font-extrabold text-black tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8 text-black shadow-sm animate-spin-slow" />
          Global Configuration
        </h2>
        <p className="text-sm text-[#5E6258] mt-1">Configure global server configurations, PWA storage rules, and mail servers.</p>
      </div>

      {/* Main Form container */}
      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        
        {/* Left column: Server Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E2E1DD] border border-[#E2E1DD] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <Server className="h-4 w-4 text-black" /> Infrastructure Node Config
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#5E6258]">SMTP Mailing Server</label>
                <input 
                  type="text" 
                  value={smtpServer}
                  onChange={(e) => setSmtpServer(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#5E6258]">SMTP Server Port</label>
                <input 
                  type="text" 
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#5E6258]">PWA Execution Mode</label>
                <select 
                  value={pwaMode}
                  onChange={(e) => setPwaMode(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2.5 text-xs text-black focus:outline-none"
                >
                  <option value="offline-first">Offline-First Service Workers</option>
                  <option value="network-only">Direct Network Fetch</option>
                  <option value="cache-fallback">Cache Fallback Cache</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#5E6258]">Database Hot Backup Schedule</label>
                <select 
                  value={dbBackup}
                  onChange={(e) => setDbBackup(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2.5 text-xs text-black focus:outline-none"
                >
                  <option value="hourly">Hourly Snapshots</option>
                  <option value="daily">Daily Cron Backups</option>
                  <option value="weekly">Weekly Archiving</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Security rules */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E1DD] border border-[#E2E1DD] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-black" /> Security Controls
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#5E6258]">Policy Restrict Level</label>
                <select 
                  value={securityLevel}
                  onChange={(e) => setSecurityLevel(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2.5 text-xs text-black focus:outline-none"
                >
                  <option value="strict">Strict (RBAC Block Direct Routes)</option>
                  <option value="moderate">Moderate (Redirect Warn)</option>
                  <option value="permissive">Permissive (Inspect Mode)</option>
                </select>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 space-y-2">
                <p className="text-[10px] font-bold text-[#5E6258] uppercase tracking-wider flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-[#00E5FF]" /> PWA Storage Capacity
                </p>
                <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-[#8B5CF6] w-[42%]" />
                </div>
                <div className="flex justify-between items-center text-[9px] text-[#5E6258] font-bold uppercase">
                  <span>Quota Used: 42%</span>
                  <span>Free Space: 1.2 GB</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-black hover:bg-black/90 hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-400/10 cursor-pointer"
          >
            <Save className="h-4 w-4" /> Save Configuration Settings
          </button>
        </div>

      </form>
    </div>
  );
}
