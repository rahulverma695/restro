'use client';

import React from 'react';
import { useAppState } from '@/context/StateContext';
import { Briefcase, UserPlus, CheckCircle2, AlertCircle, Laptop, CreditCard, BookOpen } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function ChecklistsPage() {
  const { activeUser, onboardingHires, hireOnboardCandidate, updateOnboardingChecklist } = useAppState();

  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'HRAdmin';

  if (!hasAccess) {
    return <AccessDenied suite="Onboarding Pipelines" role={activeUser.role} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E1DD] pb-4">
        <Briefcase className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Provisioning Checklists</h2>
          <p className="text-sm text-[#5E6258] mt-1">Manage onboarding tasks, sequential hardware allocations, and automated staff configurations.</p>
        </div>
      </div>

      {/* Split views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Hiring Pipeline */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm h-fit">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E1DD] pb-2">
            <UserPlus className="h-4 w-4 text-[#C0D930]" /> Candidates Pipeline Clearance
          </h3>

          <div className="space-y-3">
            {onboardingHires.filter(h => h.status === 'Pipeline').map(candidate => (
              <div 
                key={candidate.id} 
                className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 flex justify-between items-center transition-colors"
              >
                <div>
                  <h4 className="text-xs font-extrabold text-black">{candidate.name}</h4>
                  <p className="text-[9px] text-[#8C9086] font-semibold uppercase">{candidate.role} • {candidate.email}</p>
                </div>
                
                <button 
                  onClick={() => {
                    hireOnboardCandidate(candidate.id);
                    alert(`Onboarding provision checklist generated for ${candidate.name}!`);
                  }}
                  className="px-3.5 py-1.5 bg-black hover:bg-black/90 text-[9px] font-extrabold uppercase tracking-wider text-white rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Mark "Hired"
                </button>
              </div>
            ))}
            {onboardingHires.filter(h => h.status === 'Pipeline').length === 0 && (
              <p className="text-xs text-[#8C9086] italic py-4">No candidates in hiring pipeline.</p>
            )}
          </div>
        </div>

        {/* Right Side: Provisioning Active Checklists */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-[#8B5CF6] rounded-full"></span>
            Active Provisioning Checklists ({onboardingHires.filter(h => h.status === 'Hired').length})
          </h3>

          <div className="space-y-4">
            {onboardingHires.filter(h => h.status === 'Hired').map(hire => {
              const allDone = hire.checklist.it_laptop && hire.checklist.hr_payroll && hire.checklist.wiki_sop;
              
              return (
                <div 
                  key={hire.id} 
                  className="bg-white border border-[#E2E1DD] hover:border-[#8B5CF6]/20 rounded-2xl p-5 space-y-4 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start border-b border-[#E2E1DD]/50 pb-2">
                    <div>
                      <h4 className="text-xs font-extrabold text-black">{hire.name}</h4>
                      <p className="text-[9px] text-[#8C9086] font-semibold uppercase">{hire.role}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                      allDone 
                        ? 'bg-[#3CD070]/10 text-[#3CD070] border border-[#3CD070]/20' 
                        : 'bg-amber-400/10 text-amber-500 border border-amber-400/20'
                    }`}>
                      {allDone ? 'Provisioned' : 'Pending Tasks'}
                    </span>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-3 text-xs font-semibold">
                    <label className="flex items-center justify-between p-2.5 bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl hover:border-[#C0D930]/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2.5 text-black">
                        <Laptop className="h-4 w-4 text-[#8C9086]" />
                        <span>Provision Corporate IT Laptop Ticket</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={hire.checklist.it_laptop}
                        onChange={(e) => updateOnboardingChecklist(hire.id, 'it_laptop', e.target.checked)}
                        className="h-4 w-4 border-[#E2E1DD] rounded accent-[#C0D930] cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl hover:border-[#C0D930]/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2.5 text-black">
                        <CreditCard className="h-4 w-4 text-[#8C9086]" />
                        <span>Auto-Generate HR Payroll File Setup</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={hire.checklist.hr_payroll}
                        onChange={(e) => updateOnboardingChecklist(hire.id, 'hr_payroll', e.target.checked)}
                        className="h-4 w-4 border-[#E2E1DD] rounded accent-[#C0D930] cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl hover:border-[#C0D930]/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2.5 text-black">
                        <BookOpen className="h-4 w-4 text-[#8C9086]" />
                        <span>Training Tracker Wiki SOP Checks</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={hire.checklist.wiki_sop}
                        onChange={(e) => updateOnboardingChecklist(hire.id, 'wiki_sop', e.target.checked)}
                        className="h-4 w-4 border-[#E2E1DD] rounded accent-[#C0D930] cursor-pointer"
                      />
                    </label>
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
