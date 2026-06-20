'use client';

import React from 'react';
import { useAppState } from '@/context/StateContext';
import { FileText, ShieldAlert, User, Calendar, MessageSquare, Clipboard } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function CoachingPage() {
  const { activeUser, coachingLogs, employees } = useAppState();

  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'Manager' || 
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="Performance OKRs" role={activeUser.role} />;
  }

  // Filter coaching logs for target user (defaults to e2 John Doe, or activeUser if they are Employee)
  const targetId = activeUser.role === 'Employee' ? activeUser.id : 'e2';
  const logs = coachingLogs.filter(l => l.employee_id === targetId);
  const targetStaff = employees.find(e => e.id === targetId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E1DD] pb-4">
        <MessageSquare className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Coaching 1-on-1 Logs</h2>
          <p className="text-sm text-[#5E6258] mt-1">Private, persistent coaching notes and action items from weekly manager 1-on-1 check-ins.</p>
        </div>
      </div>

      {/* Main timeline */}
      <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <Clipboard className="h-4 w-4 text-[#C0D930]" /> Coaching thread: {targetStaff?.first_name} {targetStaff?.last_name}
          </h3>
          <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-2.5 py-0.5 rounded-full uppercase">
            Confidential
          </span>
        </div>

        <div className="space-y-6 relative border-l border-[#E2E1DD] ml-3 pl-6 py-2">
          {logs.map((log) => (
            <div key={log.id} className="relative space-y-2">
              {/* Timeline bullet */}
              <span className="absolute -left-[30px] top-1.5 h-4 w-4 rounded-full border-2 border-[#8B5CF6] bg-white flex items-center justify-center">
                <span className="h-1.5 w-1.5 bg-[#8B5CF6] rounded-full" />
              </span>

              <div className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-5 hover:border-[#8B5CF6]/30 transition-colors shadow-sm space-y-2">
                <div className="flex justify-between items-center text-[10px] text-[#5E6258] font-bold uppercase">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[#8C9086]" /> {log.date}</span>
                  <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-[#8C9086]" /> Manager Review</span>
                </div>
                <div className="bg-white border border-[#E2E1DD]/70 rounded-lg p-4 text-xs text-[#1A1C18] font-semibold leading-relaxed">
                  "{log.notes}"
                </div>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-12 text-xs text-[#8C9086] italic">
              No coaching check-in entries logged for this period.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
