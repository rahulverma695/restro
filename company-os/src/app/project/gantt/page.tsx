'use client';

import React from 'react';
import { useAppState } from '@/context/StateContext';
import { Calendar, ShieldAlert, FolderTree, Info } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface GanttTask {
  id: string;
  name: string;
  startWeek: number; // 1-indexed
  durationWeeks: number;
  progress: number; // percentage
  dependencies?: string[]; // task IDs
}

const ganttTasks: GanttTask[] = [
  { id: 'gt1', name: 'Establish 10-Suite Schema & RBAC Configuration', startWeek: 1, durationWeeks: 2, progress: 100 },
  { id: 'gt2', name: 'Integrate Geolocated Shift Logger', startWeek: 2, durationWeeks: 2, progress: 80, dependencies: ['gt1'] },
  { id: 'gt3', name: 'Build Interactive Floor Desk Hoteling Click Map', startWeek: 3, durationWeeks: 3, progress: 10, dependencies: ['gt1'] },
  { id: 'gt4', name: 'Scaffold Secure Role-Locked Vault', startWeek: 4, durationWeeks: 2, progress: 0, dependencies: ['gt2', 'gt3'] }
];

export default function GanttPage() {
  const { activeUser } = useAppState();

  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'HRAdmin' || 
    activeUser.role === 'Manager' || 
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="Project Management" role={activeUser.role} />;
  }

  // Weeks range definition
  const totalWeeks = 6;
  const weeks = Array.from({ length: totalWeeks }, (_, idx) => idx + 1);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E1DD] pb-4">
        <FolderTree className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Gantt Visualizer</h2>
          <p className="text-sm text-[#5E6258] mt-1">Chronological department project timeline tracking overlapping dependencies and milestones.</p>
        </div>
      </div>

      {/* Main Gantt Visualizer Wrapper */}
      <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4 min-w-[700px]">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#C0D930]" /> Sprint Milestone Gantt Chart
          </h3>
          <div className="flex gap-4 text-[9px] text-[#5E6258] font-bold uppercase">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-[#8B5CF6] rounded" /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-[#C0D930] rounded" /> In Progress</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-[#EAE8E3] rounded" /> Backlog</span>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="min-w-[800px] border border-[#E2E1DD] rounded-xl overflow-hidden bg-[#FAF9F6]/30">
          
          {/* Header Row: Weeks */}
          <div className="grid grid-cols-12 border-b border-[#E2E1DD] bg-[#FAF9F6]/80 text-[10px] font-extrabold text-black uppercase text-center py-2.5">
            <div className="col-span-4 text-left pl-4 border-r border-[#E2E1DD]">Project Sprint Tasks</div>
            <div className="col-span-8 grid grid-cols-6 divide-x divide-[#E2E1DD]">
              {weeks.map(w => (
                <div key={w} className="py-0.5 font-extrabold">Week {w}</div>
              ))}
            </div>
          </div>

          {/* Rows: Individual Task Timeline Bars */}
          <div className="divide-y divide-[#E2E1DD]">
            {ganttTasks.map((task) => {
              const startCol = task.startWeek - 1; // 0-indexed column
              const spanCols = task.durationWeeks;

              return (
                <div key={task.id} className="grid grid-cols-12 items-center text-xs py-4 hover:bg-white/50 transition-colors">
                  
                  {/* Task Metadata */}
                  <div className="col-span-4 pl-4 pr-3 border-r border-[#E2E1DD] space-y-1">
                    <p className="font-extrabold text-black leading-snug">{task.name}</p>
                    <div className="flex items-center gap-2 text-[9px] text-[#8C9086] font-semibold">
                      <span>Start: W{task.startWeek}</span>
                      <span>•</span>
                      <span>Span: {task.durationWeeks} Wks</span>
                      {task.dependencies && (
                        <>
                          <span>•</span>
                          <span className="text-[#8B5CF6] flex items-center gap-0.5" title={`Requires: ${task.dependencies.join(', ')}`}>
                            <Info className="h-2.5 w-2.5" /> Dep
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Visual Timeline Bar */}
                  <div className="col-span-8 grid grid-cols-6 h-8 relative divide-x divide-[#E2E1DD]/30">
                    
                    {/* Empty Grid Cells */}
                    {weeks.map(w => (
                      <div key={w} className="h-full" />
                    ))}

                    {/* Timeline Bar Overlay */}
                    <div 
                      className="absolute inset-y-1.5 left-2 right-2 rounded-lg border flex items-center justify-between px-3 shadow-sm select-none transition-all duration-300"
                      style={{
                        gridColumnStart: startCol + 1,
                        gridColumnEnd: startCol + 1 + spanCols,
                        backgroundColor: task.progress === 100 ? 'rgba(139, 92, 246, 0.08)' : task.progress > 0 ? 'rgba(192, 217, 48, 0.15)' : '#FAF9F6',
                        borderColor: task.progress === 100 ? '#8B5CF6' : task.progress > 0 ? '#C0D930' : '#E2E1DD'
                      }}
                    >
                      <span className="text-[10px] font-extrabold text-black truncate pr-2">{task.progress}% Complete</span>
                      <div className="h-2 w-16 bg-[#EAE8E3] rounded-full overflow-hidden border border-[#E2E1DD]/40 shrink-0">
                        <div 
                          className={`h-full rounded-full ${task.progress === 100 ? 'bg-[#8B5CF6]' : 'bg-[#C0D930]'}`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
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
