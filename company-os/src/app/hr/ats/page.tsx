'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { Layers, Plus, UserPlus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface Candidate {
  id: string;
  name: string;
  role: string;
  stage: 'screen' | 'interview' | 'offer' | 'hired';
  experience: string;
  email: string;
}

const initialCandidates: Candidate[] = [
  { id: 'c1', name: 'Sophia Miller', role: 'Staff Frontend Engineer', stage: 'interview', experience: '8 Yrs', email: 'sophia.m@gmail.com' },
  { id: 'c2', name: 'Liam Davies', role: 'Senior DevOps Architect', stage: 'screen', experience: '6 Yrs', email: 'liam.d@gmail.com' },
  { id: 'c3', name: 'Emma Wilson', role: 'Director of Product Ops', stage: 'offer', experience: '12 Yrs', email: 'emma.w@outlook.com' },
  { id: 'c4', name: 'Noah Brown', role: 'Security Analyst Specialist', stage: 'hired', experience: '4 Yrs', email: 'noah.b@gmail.com' },
];

export default function ATSKanbanPage() {
  const { activeUser } = useAppState();
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');

  // Access check
  if (activeUser.role !== 'SuperAdmin' && activeUser.role !== 'HRAdmin') {
    return <AccessDenied suite="HR Operations" role={activeUser.role} />;
  }

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;
    const newCand: Candidate = {
      id: `cand_${Date.now()}`,
      name,
      role,
      stage: 'screen',
      experience: experience || 'N/A',
      email: `${name.toLowerCase().replace(' ', '.')}@test.com`,
    };
    setCandidates(prev => [...prev, newCand]);
    setName('');
    setRole('');
    setExperience('');
  };

  const shiftStage = (id: string, direction: 'forward' | 'backward') => {
    const stages: Array<Candidate['stage']> = ['screen', 'interview', 'offer', 'hired'];
    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        const currIndex = stages.indexOf(c.stage);
        let nextIndex = currIndex + (direction === 'forward' ? 1 : -1);
        if (nextIndex >= 0 && nextIndex < stages.length) {
          return { ...c, stage: stages[nextIndex] };
        }
      }
      return c;
    }));
  };

  const removeCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const columns: Array<{ id: Candidate['stage']; name: string; color: string }> = [
    { id: 'screen', name: 'Resume Screen', color: 'border-t-sky-500' },
    { id: 'interview', name: 'Technical Interview', color: 'border-t-[#8B5CF6]' },
    { id: 'offer', name: 'Offer Letter Out', color: 'border-t-amber-400' },
    { id: 'hired', name: 'Hired & Cleared', color: 'border-t-[#3CD070]' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none h-full flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E1DD] pb-4 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold text-black tracking-tight flex items-center gap-3">
            <Layers className="h-8 w-8 text-[#00E5FF] shadow-sm" />
            ATS Kanban Board
          </h2>
          <p className="text-sm text-[#5E6258] mt-1">Screen candidates, schedule tech loops, and track pipeline stats.</p>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 overflow-hidden">
        
        {/* Kanban Columns */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-y-auto h-full pr-2 pb-6">
          {columns.map(col => {
            const colCandidates = candidates.filter(c => c.stage === col.id);
            return (
              <div key={col.id} className={`bg-[#FAF9F6] border border-[#E2E1DD] border border-[#E2E1DD] border-t-2 ${col.color} rounded-2xl p-4 flex flex-col h-full min-h-[400px]`}>
                <div className="flex items-center justify-between border-b border-[#E2E1DD]/60 pb-2 mb-4 shrink-0">
                  <span className="text-[10px] font-extrabold text-black uppercase tracking-wider">{col.name}</span>
                  <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] px-2 py-0.5 rounded-full border border-[#E2E1DD]">
                    {colCandidates.length}
                  </span>
                </div>
                
                {/* Candidate list */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {colCandidates.map(cand => (
                    <div key={cand.id} className="bg-[#FAF9F6] border border-[#E2E1DD] hover:border-[#C0D930]/40 rounded-xl p-3.5 space-y-3 relative group transition-all">
                      <div>
                        <h4 className="text-xs font-bold text-black leading-tight">{cand.name}</h4>
                        <p className="text-[9px] text-[#5E6258] font-bold uppercase mt-0.5">{cand.role}</p>
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-[#5E6258] border-t border-[#E2E1DD]/60 pt-2">
                        <span>Exp: {cand.experience}</span>
                        <span className="truncate max-w-[100px]">{cand.email}</span>
                      </div>

                      {/* Direction and delete actions */}
                      <div className="flex items-center justify-between border-t border-[#E2E1DD]/40 pt-2 shrink-0">
                        <button 
                          onClick={() => removeCandidate(cand.id)}
                          className="text-[#FF3E3E] hover:bg-[#FF3E3E]/10 p-1 rounded transition-colors"
                          title="Archive Candidate"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <div className="flex items-center gap-1">
                          {col.id !== 'screen' && (
                            <button 
                              onClick={() => shiftStage(cand.id, 'backward')}
                              className="text-[#5E6258] hover:text-black p-0.5 hover:bg-[#1E293B] rounded transition-colors"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                          )}
                          {col.id !== 'hired' && (
                            <button 
                              onClick={() => shiftStage(cand.id, 'forward')}
                              className="text-[#00E5FF] hover:text-black p-0.5 hover:bg-[#1E293B] rounded transition-colors"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {colCandidates.length === 0 && (
                    <div className="h-full flex items-center justify-center py-12 text-[10px] text-[#5E6258] italic">
                      No applicants in stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Fast Submit Form */}
        <div className="bg-white border border-[#E2E1DD] border border-[#E2E1DD] rounded-2xl p-5 h-fit space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-[#00E5FF]" /> Add Applicant
          </h3>
          <form onSubmit={handleAddCandidate} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Applicant Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Full candidate name..."
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Target Position</label>
              <input 
                type="text" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                placeholder="e.g. Lead Dev, Designer..."
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Years of Experience</label>
              <input 
                type="text" 
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 5 Yrs..."
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-black hover:bg-black/90 hover:bg-black hover:bg-black/90/80 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              Log Applicant
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
