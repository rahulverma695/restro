'use client';

import React from 'react';
import { useAppState } from '@/context/StateContext';
import { BookOpen, CheckCircle, ShieldAlert, FileText, ClipboardList } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function TrainingPage() {
  const { activeUser, onboardingHires, wikiDocs, updateOnboardingChecklist } = useAppState();

  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'HRAdmin' || 
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="Onboarding Pipelines" role={activeUser.role} />;
  }

  const isHR = activeUser.role === 'SuperAdmin' || activeUser.role === 'HRAdmin';

  // For Employee, we show their personal Training Checklist (mocked using John Doe)
  const employeeHire = onboardingHires.find(h => h.name === 'Sophia Miller') || onboardingHires[0];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E1DD] pb-4">
        <BookOpen className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Training Tracker</h2>
          <p className="text-sm text-[#5E6258] mt-1">Track checklist status of mandatory company Wiki SOPs and security policy reviews for new hires.</p>
        </div>
      </div>

      {isHR ? (
        /* HR/Admin Monitor View */
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[#C0D930]" /> Mandatory Training SOP Monitor
          </h3>
          
          <div className="space-y-4">
            {onboardingHires.filter(h => h.status === 'Hired').map(hire => (
              <div 
                key={hire.id} 
                className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-5 flex justify-between items-center transition-all"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-black">{hire.name}</h4>
                  <p className="text-[9px] text-[#8C9086] font-semibold uppercase">{hire.role}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                    hire.checklist.wiki_sop 
                      ? 'bg-[#3CD070]/10 text-[#3CD070] border border-[#3CD070]/20' 
                      : 'bg-amber-400/10 text-amber-500 border border-amber-400/20'
                  }`}>
                    {hire.checklist.wiki_sop ? 'SOP Read Complete' : 'SOP Read Pending'}
                  </span>
                  
                  <button 
                    onClick={() => {
                      updateOnboardingChecklist(hire.id, 'wiki_sop', !hire.checklist.wiki_sop);
                    }}
                    className="px-3 py-1.5 border border-[#E2E1DD] hover:border-black rounded-lg text-black bg-white text-[9px] font-extrabold uppercase tracking-wide cursor-pointer transition-colors shadow-sm"
                  >
                    Toggle Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Standard Employee checklist view */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Checklist */}
          <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 shadow-sm h-fit space-y-4">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2">
              My Week One SOP Checklist
            </h3>
            
            <div className="space-y-3 font-semibold text-xs">
              {wikiDocs.map((doc, idx) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl hover:border-[#C0D930]/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-black">
                    <FileText className="h-4 w-4 text-[#8C9086]" />
                    <span className="truncate max-w-[150px]">{doc.title}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={employeeHire.checklist.wiki_sop}
                    onChange={(e) => updateOnboardingChecklist(employeeHire.id, 'wiki_sop', e.target.checked)}
                    className="h-4 w-4 border-[#E2E1DD] rounded accent-[#C0D930] cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Training manual instructions */}
          <div className="lg:col-span-2 bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm h-fit">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#3CD070]" /> Training Manual
            </h3>
            <p className="text-xs text-[#5E6258] leading-relaxed">
              Welcome to the Company OS training portal! Under corporate compliance rules, all new recruits must review the general onboarding handbook and development standards wiki documents during week one. 
            </p>
            <p className="text-xs text-[#5E6258] leading-relaxed">
              Once you have finished reading the required pages under the **Notice Board** or **Wiki SOP Guides**, check off the items on the left to verify your week one compliance.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
