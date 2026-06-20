'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { Layers, Plus, ArrowRight, ArrowLeft, Trash2, Clock } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function KanbanPage() {
  const { activeUser, projectTasks, employees, addProjectTask, toggleTaskTimer, changeTaskStage } = useAppState();

  // Create task modal states
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [assigneeId, setAssigneeId] = useState(employees[0]?.id || '');

  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'HRAdmin' || 
    activeUser.role === 'Manager' || 
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="Project Management" role={activeUser.role} />;
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addProjectTask(title.trim(), priority, assigneeId);
    setTitle('');
    alert('Task successfully created on Kanban board!');
  };

  const todoTasks = projectTasks.filter(t => t.stage === 'todo');
  const inProgressTasks = projectTasks.filter(t => t.stage === 'inprogress');
  const doneTasks = projectTasks.filter(t => t.stage === 'done');

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E1DD] pb-4 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight flex items-center gap-3">
            <Layers className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
            Agile Kanban Board
          </h2>
          <p className="text-sm text-[#5E6258] mt-1">Track active projects workflows, estimate sprints targets, and log billable timers.</p>
        </div>
      </div>

      {/* Split Create Task & Columns */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 overflow-hidden">
        
        {/* Left column: Create Task Form */}
        <div className="w-full lg:w-80 bg-white border border-[#E2E1DD] rounded-2xl p-5 shrink-0 h-fit shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E1DD] pb-2">
            <Plus className="h-4 w-4 text-[#C0D930]" /> New Sprint Task
          </h3>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Task Description</label>
              <textarea 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                rows={3}
                placeholder="e.g. Set up JWT sessions credentials..."
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Assignee Worker</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black focus:outline-none transition-all"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Priority Severity</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black focus:outline-none transition-all"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Add to Backlog
            </button>
          </form>
        </div>

        {/* Right column: Columns layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto lg:overflow-visible pb-4 min-h-0">
          
          {/* Column 1: To Do */}
          <div className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-2xl p-4 flex flex-col min-h-[400px] lg:h-full overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-2 mb-4 shrink-0">
              <span className="text-xs font-extrabold text-black uppercase tracking-wider">Backlog / To Do</span>
              <span className="text-[9px] text-[#5E6258] font-bold bg-[#EAE8E3] px-2 py-0.5 rounded-full">{todoTasks.length} Tasks</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {todoTasks.map(task => {
                const dev = employees.find(e => e.id === task.assignee_id);
                return (
                  <div key={task.id} className="bg-white border border-[#E2E1DD] rounded-xl p-4 space-y-3 shadow-sm hover:border-[#8B5CF6]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        task.priority === 'high' ? 'bg-[#FF3E3E]/10 text-[#FF3E3E] border-[#FF3E3E]/20' : task.priority === 'medium' ? 'bg-amber-400/10 text-amber-500 border border-amber-400/20' : 'bg-[#3CD070]/10 text-[#3CD070] border border-[#3CD070]/20'
                      }`}>
                        {task.priority}
                      </span>
                      {dev && (
                        <div className="h-6 w-6 rounded-md bg-[#EAE8E3] border border-[#E2E1DD] flex items-center justify-center font-bold text-[9px] text-black uppercase" title={dev.first_name}>
                          {dev.first_name[0]}{dev.last_name[0]}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-black leading-snug">"{task.title}"</p>
                    <div className="flex items-center justify-between border-t border-[#E2E1DD]/50 pt-2 text-[10px]">
                      <span className="text-[#8C9086] font-mono">{formatTime(task.time_spent)}</span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => changeTaskStage(task.id, 'inprogress')}
                          className="h-6 w-6 border border-[#E2E1DD] hover:border-black rounded flex items-center justify-center text-black hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                          title="Move to In Progress"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-2xl p-4 flex flex-col min-h-[400px] lg:h-full overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-2 mb-4 shrink-0">
              <span className="text-xs font-extrabold text-black uppercase tracking-wider">In Progress</span>
              <span className="text-[9px] text-[#5E6258] font-bold bg-[#EAE8E3] px-2 py-0.5 rounded-full">{inProgressTasks.length} Tasks</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {inProgressTasks.map(task => {
                const dev = employees.find(e => e.id === task.assignee_id);
                return (
                  <div key={task.id} className="bg-white border border-[#E2E1DD] rounded-xl p-4 space-y-3 shadow-sm hover:border-[#8B5CF6]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        task.priority === 'high' ? 'bg-[#FF3E3E]/10 text-[#FF3E3E] border-[#FF3E3E]/20' : task.priority === 'medium' ? 'bg-amber-400/10 text-amber-500 border border-amber-400/20' : 'bg-[#3CD070]/10 text-[#3CD070] border border-[#3CD070]/20'
                      }`}>
                        {task.priority}
                      </span>
                      {dev && (
                        <div className="h-6 w-6 rounded-md bg-[#EAE8E3] border border-[#E2E1DD] flex items-center justify-center font-bold text-[9px] text-black uppercase">
                          {dev.first_name[0]}{dev.last_name[0]}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-black leading-snug">"{task.title}"</p>
                    <div className="flex items-center justify-between border-t border-[#E2E1DD]/50 pt-2 text-[10px]">
                      <button 
                        onClick={() => toggleTaskTimer(task.id)}
                        className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 border transition-all ${
                          task.timer_active ? 'bg-[#FF3E3E]/10 text-[#FF3E3E] border-[#FF3E3E]/20 animate-pulse' : 'bg-[#FAF9F6] border-[#E2E1DD] text-black hover:border-black'
                        }`}
                      >
                        <Clock className="h-3 w-3" /> {task.timer_active ? 'Stop Timer' : 'Start Timer'}
                      </button>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#8C9086] font-mono mr-1.5">{formatTime(task.time_spent)}</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => changeTaskStage(task.id, 'todo')}
                            className="h-6 w-6 border border-[#E2E1DD] hover:border-black rounded flex items-center justify-center text-black hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                            title="Move to Backlog"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => changeTaskStage(task.id, 'done')}
                            className="h-6 w-6 border border-[#E2E1DD] hover:border-black rounded flex items-center justify-center text-black hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                            title="Move to Done"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3: Done */}
          <div className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-2xl p-4 flex flex-col min-h-[400px] lg:h-full overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-2 mb-4 shrink-0">
              <span className="text-xs font-extrabold text-[#3CD070] uppercase tracking-wider">Completed / Done</span>
              <span className="text-[9px] text-[#3CD070] font-bold bg-[#3CD070]/10 px-2 py-0.5 rounded-full">{doneTasks.length} Tasks</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {doneTasks.map(task => {
                const dev = employees.find(e => e.id === task.assignee_id);
                return (
                  <div key={task.id} className="bg-white border border-[#E2E1DD] rounded-xl p-4 space-y-3 shadow-sm opacity-85 hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-black hover:bg-black/90/10 border border-[#C0D930]/20 text-[#3CD070]">
                        Done
                      </span>
                      {dev && (
                        <div className="h-6 w-6 rounded-md bg-[#EAE8E3] border border-[#E2E1DD] flex items-center justify-center font-bold text-[9px] text-[#8C9086] uppercase">
                          {dev.first_name[0]}{dev.last_name[0]}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#8C9086] line-through leading-snug">"{task.title}"</p>
                    <div className="flex items-center justify-between border-t border-[#E2E1DD]/50 pt-2 text-[10px]">
                      <span className="text-[#8C9086] font-mono">{formatTime(task.time_spent)} Logged</span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => changeTaskStage(task.id, 'inprogress')}
                          className="h-6 w-6 border border-[#E2E1DD] hover:border-black rounded flex items-center justify-center text-[#8C9086] hover:text-black hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                          title="Reopen Task"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
