'use client';

import React from 'react';
import { useAppState } from '@/context/StateContext';
import { Clock, Play, Square, Award, CheckCircle, Timer } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function TimersPage() {
  const { activeUser, projectTasks, employees, toggleTaskTimer } = useAppState();

  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'HRAdmin' || 
    activeUser.role === 'Manager' || 
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="Project Management" role={activeUser.role} />;
  }

  // Filter tasks that have active timers or logged time
  const activeTimers = projectTasks.filter(t => t.timer_active);
  const loggedTasks = projectTasks.filter(t => t.time_spent > 0);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotalTime = (tasksList: typeof projectTasks) => {
    const totalSecs = tasksList.reduce((sum, t) => sum + t.time_spent, 0);
    return (totalSecs / 3600).toFixed(2);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E1DD] pb-4">
        <Timer className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Time-to-Task Tracking</h2>
          <p className="text-sm text-[#5E6258] mt-1">Audit active task billable logs, log project time cards, and check employee timesheet metrics.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#5E6258]">Active Clocks Running</span>
            <p className="text-2xl font-extrabold text-[#3CD070]">{activeTimers.length} Active</p>
          </div>
          <div className="bg-[#3CD070]/10 p-2.5 rounded-xl border border-[#3CD070]/20 text-[#3CD070]">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#5E6258]">Total Logged Billable Hours</span>
            <p className="text-2xl font-extrabold text-black">{calculateTotalTime(projectTasks)} Hours</p>
          </div>
          <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E2E1DD]">
            <CheckCircle className="h-5 w-5 text-black" />
          </div>
        </div>
      </div>

      {/* Active Clocks Console */}
      <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">Active Clocks Console</h3>
        
        <div className="space-y-3">
          {activeTimers.map(task => {
            const dev = employees.find(e => e.id === task.assignee_id);
            return (
              <div 
                key={task.id} 
                className="bg-[#FAF9F6] border-2 border-[#E1FF4B] rounded-xl p-4 flex justify-between items-center shadow-md animate-pulse"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-black">"{task.title}"</span>
                    <span className="text-[8px] bg-black hover:bg-black/90/10 text-[#3CD070] border border-[#C0D930]/20 px-2 py-0.5 rounded uppercase font-bold">
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-[9px] text-[#8C9086] font-semibold uppercase">Assigned: {dev?.first_name} {dev?.last_name} ({dev?.department})</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-md font-mono font-extrabold text-black bg-white border border-[#E2E1DD] px-3.5 py-1.5 rounded-lg shadow-sm">
                    {formatTime(task.time_spent)}
                  </span>
                  
                  <button 
                    onClick={() => toggleTaskTimer(task.id)}
                    className="h-8 px-4 py-1.5 bg-[#FF3E3E] text-white hover:bg-[#FF3E3E]/90 text-[9px] font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" /> Stop
                  </button>
                </div>
              </div>
            );
          })}
          {activeTimers.length === 0 && (
            <p className="text-xs text-[#8C9086] italic text-center py-6">No active clocks currently running. Go to Kanban Board to initialize task timers.</p>
          )}
        </div>
      </div>

      {/* Billable Log Ledger */}
      <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">Billable Log Ledger</h3>
        
        <div className="space-y-3">
          {loggedTasks.map(task => {
            const dev = employees.find(e => e.id === task.assignee_id);
            return (
              <div 
                key={task.id} 
                className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 flex justify-between items-center text-xs hover:border-[#E2E1DD]/80 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-black">"{task.title}"</p>
                  <p className="text-[9px] text-[#8C9086] font-semibold uppercase">Logged by: {dev?.first_name} {dev?.last_name} • Stage: {task.stage}</p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-black bg-white border border-[#E2E1DD] px-2.5 py-1 rounded">
                    {formatTime(task.time_spent)}
                  </span>
                  {!task.timer_active && task.stage !== 'done' && (
                    <button 
                      onClick={() => toggleTaskTimer(task.id)}
                      className="h-7 px-2.5 border border-[#E2E1DD] hover:border-black rounded-lg text-black hover:bg-white flex items-center gap-1 cursor-pointer transition-all text-[8px] font-extrabold uppercase"
                    >
                      <Play className="h-2.5 w-2.5 fill-current" /> Resume
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
