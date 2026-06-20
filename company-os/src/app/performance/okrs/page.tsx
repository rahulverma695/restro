'use client';

import React from 'react';
import { useAppState } from '@/context/StateContext';
import { Activity, Target, TrendingUp, Briefcase } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function OKRsPage() {
  const { activeUser, okrs } = useAppState();

  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'HRAdmin' || 
    activeUser.role === 'Manager' || 
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="Performance OKRs" role={activeUser.role} />;
  }

  const companyOkrs = okrs.filter(o => o.type === 'company');
  const deptOkrs = okrs.filter(o => o.type === 'department');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E1DD] pb-4">
        <Target className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Performance OKRs</h2>
          <p className="text-sm text-[#5E6258] mt-1">Review top-level corporate goals and track alignments with department targets.</p>
        </div>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Corporate Goals */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-3">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#C0D930]" /> Corporate Company OKRs
            </h3>
            <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-2.5 py-0.5 rounded-full">
              Global
            </span>
          </div>

          <div className="space-y-6">
            {companyOkrs.map((okr) => {
              const progress = Math.min((okr.current / okr.target) * 100, 100);
              return (
                <div key={okr.id} className="space-y-2">
                  <div className="flex justify-between items-start text-xs">
                    <p className="font-extrabold text-black leading-snug">"{okr.title}"</p>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-bold text-[#8C9086] uppercase">Progress</span>
                      <p className="font-extrabold text-black">{progress.toFixed(2)}%</p>
                    </div>
                  </div>

                  {/* Progress bar container */}
                  <div className="relative">
                    <div className="h-2.5 w-full bg-[#FAF9F6] border border-[#E2E1DD]/80 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-black hover:bg-black/90 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[8px] text-[#8C9086] font-mono mt-1">
                      <span>Base: 0</span>
                      <span>Target: {okr.target} (Current: {okr.current})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Department Targets */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-3">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#8B5CF6]" /> Department Alignment OKRs
            </h3>
            <span className="text-[9px] text-[#8C9086] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-2.5 py-0.5 rounded-full">
              Operational
            </span>
          </div>

          <div className="space-y-6">
            {deptOkrs.map((okr) => {
              const progress = Math.min((okr.current / okr.target) * 100, 100);
              return (
                <div key={okr.id} className="space-y-2">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="text-[8px] font-extrabold text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-2 py-0.2 rounded uppercase">
                        {okr.dept_name}
                      </span>
                      <p className="font-extrabold text-black leading-snug mt-1.5">"{okr.title}"</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-bold text-[#8C9086] uppercase">Progress</span>
                      <p className="font-extrabold text-black">{progress.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="h-2.5 w-full bg-[#FAF9F6] border border-[#E2E1DD]/80 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#C0D930] rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[8px] text-[#8C9086] font-mono mt-1">
                      <span>Base: 0</span>
                      <span>Target: {okr.target} (Current: {okr.current})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
