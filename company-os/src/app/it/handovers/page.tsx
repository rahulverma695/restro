'use client';

import React from 'react';
import { useAppState } from '@/context/StateContext';
import { FileText, Clock, User, ClipboardList, MapPin } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function HandoversPage() {
  const { activeUser, shifts, employees } = useAppState();

  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'Manager' || 
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="IT Operations" role={activeUser.role} />;
  }

  // Filter completed shifts that have handover notes or clock_out times
  const completedShifts = shifts.filter(s => s.clock_out !== null);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E1DD] pb-4">
        <FileText className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Shift Handovers</h2>
          <p className="text-sm text-[#5E6258] mt-1">Operational handover logs from 24/7 roles and shifts clock-out notes.</p>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[#C0D930]" /> Handover Log Ledger
          </h3>
          <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-2.5 py-0.5 rounded-full">
            {completedShifts.length} Shift Logs
          </span>
        </div>

        <div className="space-y-4">
          {completedShifts.map((shift) => {
            const staff = employees.find(e => e.id === shift.employee_id);
            return (
              <div 
                key={shift.id} 
                className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-5 space-y-3 hover:border-[#8B5CF6]/30 transition-colors shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E1DD]/50 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 bg-[#EAE8E3] border border-[#E2E1DD] rounded-lg flex items-center justify-center font-extrabold text-[10px] text-black uppercase">
                      {staff?.first_name[0]}{staff?.last_name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-black">{staff?.first_name} {staff?.last_name}</p>
                      <p className="text-[9px] text-[#8C9086] font-semibold uppercase">{staff?.role} • {staff?.department}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#5E6258] font-bold uppercase">
                    <span className="flex items-center gap-1.5 bg-white border border-[#E2E1DD] px-2 py-0.5 rounded">
                      <Clock className="h-3.5 w-3.5 text-[#8B5CF6]" />
                      In: {shift.clock_in}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white border border-[#E2E1DD] px-2 py-0.5 rounded">
                      <Clock className="h-3.5 w-3.5 text-[#FF3E3E]" />
                      Out: {shift.clock_out}
                    </span>
                    {shift.location && (
                      <span className="flex items-center gap-1.5 bg-white border border-[#E2E1DD] px-2 py-0.5 rounded">
                        <MapPin className="h-3.5 w-3.5 text-[#3CD070]" />
                        HQ [Loc: {shift.location.lat.toFixed(2)}, {shift.location.lng.toFixed(2)}]
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] text-[#8C9086] font-bold uppercase">Handover Comments</span>
                  <div className="bg-white border border-[#E2E1DD]/70 rounded-lg p-3 text-xs text-[#1A1C18] font-semibold leading-relaxed">
                    "{shift.notes || 'No handover comments supplied.'}"
                  </div>
                </div>
              </div>
            );
          })}

          {completedShifts.length === 0 && (
            <div className="text-center py-16 space-y-2">
              <User className="h-10 w-10 text-[#8C9086] mx-auto animate-pulse" />
              <p className="text-xs text-black font-extrabold uppercase">No Shift Handovers Logged</p>
              <p className="text-[10px] text-[#5E6258]">Shifts handover notes will populate here when staff clock out of online status.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
