'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { ShieldAlert, Terminal, Search } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function AdminAuditPage() {
  const { activeUser, systemAuditLogs, employees } = useAppState();
  const [search, setSearch] = useState('');

  // SuperAdmin check
  if (activeUser.role !== 'SuperAdmin') {
    return <AccessDenied suite="Command Center" role={activeUser.role} />;
  }

  const filteredLogs = systemAuditLogs.filter(log => {
    const actor = employees.find(e => e.id === log.actor_id);
    const actorName = actor ? `${actor.first_name} ${actor.last_name}` : 'System Agent';
    const matchesSearch = 
      actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.timestamp.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E1DD] pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight flex items-center gap-3">
            <Terminal className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
            System Audit Logs
          </h2>
          <p className="text-sm text-[#5E6258] mt-1">Review global security event audits, authorization diagnostics, state changes, and credentials logs.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5E6258]" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search operator, action, timestamp..."
            className="w-full bg-white border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl pl-9 pr-3.5 py-2 text-xs text-black focus:outline-none transition-all placeholder-[#8C9086]"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-black uppercase tracking-wider">Audit Event Registry ({filteredLogs.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E1DD] text-[9px] font-bold uppercase tracking-wider text-[#5E6258]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Log Action Event Description</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E1DD]/40 text-xs text-[#5E6258] font-mono">
              {filteredLogs.map((log) => {
                const actor = employees.find(e => e.id === log.actor_id);
                const name = actor ? `${actor.first_name} ${actor.last_name}` : 'System Node';
                return (
                  <tr key={log.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3.5 px-3 text-[10px] text-black font-sans shrink-0">{log.timestamp}</td>
                    <td className="py-3.5 px-3 font-sans font-bold text-black">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded bg-[#EAE8E3] border border-[#E2E1DD] flex items-center justify-center font-bold text-[8px] text-black uppercase shrink-0">
                          {name[0]}
                        </div>
                        <span>{name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-sans text-[#1A1C18] font-semibold leading-relaxed">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase font-sans bg-black hover:bg-black/90/10 text-[#3CD070] border border-[#C0D930]/20">
                        Success
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-[#8C9086] italic font-sans">No audit events matches query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
