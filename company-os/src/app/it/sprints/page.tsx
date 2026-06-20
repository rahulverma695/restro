'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { Layers, Plus, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface Task {
  id: string;
  title: string;
  stage: 'todo' | 'progress' | 'qa' | 'done';
  priority: 'low' | 'medium' | 'high';
  storyPoints: number;
}

const initialTasks: Task[] = [
  { id: 't-101', title: 'Implement local-first StateContext', stage: 'done', priority: 'high', storyPoints: 5 },
  { id: 't-102', title: 'Structure Next.js routing hierarchy', stage: 'done', priority: 'high', storyPoints: 3 },
  { id: 't-103', title: 'Build interactive Directory cards', stage: 'progress', priority: 'medium', storyPoints: 2 },
  { id: 't-104', title: 'Refactor IT Helpdesk Split Pane', stage: 'progress', priority: 'medium', storyPoints: 5 },
  { id: 't-105', title: 'Add Finance Ledger sheets', stage: 'todo', priority: 'medium', storyPoints: 3 },
  { id: 't-106', title: 'Compile and fix type declarations', stage: 'qa', priority: 'high', storyPoints: 2 },
];

export default function AgileSprintsPage() {
  const { activeUser } = useAppState();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [title, setTitle] = useState('');
  const [pri, setPri] = useState<Task['priority']>('medium');
  const [pts, setPts] = useState('3');

  // Access check
  if (activeUser.role !== 'SuperAdmin' && activeUser.role !== 'Manager' && activeUser.role !== 'Employee') {
    return <AccessDenied suite="IT & Service" role={activeUser.role} />;
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const newTask: Task = {
      id: `t-${Date.now().toString().slice(-3)}`,
      title,
      stage: 'todo',
      priority: pri,
      storyPoints: parseInt(pts) || 1,
    };
    setTasks(prev => [...prev, newTask]);
    setTitle('');
  };

  const moveTask = (id: string, dir: 'forward' | 'backward') => {
    const stages: Array<Task['stage']> = ['todo', 'progress', 'qa', 'done'];
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const currIndex = stages.indexOf(t.stage);
        let nextIndex = currIndex + (dir === 'forward' ? 1 : -1);
        if (nextIndex >= 0 && nextIndex < stages.length) {
          return { ...t, stage: stages[nextIndex] };
        }
      }
      return t;
    }));
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const columns: Array<{ id: Task['stage']; name: string; color: string }> = [
    { id: 'todo', name: 'To Do', color: 'border-t-sky-500' },
    { id: 'progress', name: 'In Progress', color: 'border-t-[#8B5CF6]' },
    { id: 'qa', name: 'Code Review/QA', color: 'border-t-amber-400' },
    { id: 'done', name: 'Completed', color: 'border-t-[#3CD070]' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none h-full flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E1DD] pb-4 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold text-black tracking-tight flex items-center gap-3">
            <Layers className="h-8 w-8 text-[#FF3E3E] shadow-[0_0_15px_rgba(255,62,62,0.2)]" />
            Agile Sprints
          </h2>
          <p className="text-sm text-[#5E6258] mt-1">Review active backlog sprints, move issue cards, and inspect project story metrics.</p>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 overflow-hidden">
        
        {/* Kanban Board */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-y-auto h-full pr-2 pb-6">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.stage === col.id);
            return (
              <div key={col.id} className={`bg-[#FAF9F6] border border-[#E2E1DD] border border-[#E2E1DD] border-t-2 ${col.color} rounded-2xl p-4 flex flex-col h-full min-h-[400px]`}>
                <div className="flex items-center justify-between border-b border-[#E2E1DD]/60 pb-2 mb-4 shrink-0">
                  <span className="text-[10px] font-extrabold text-black uppercase tracking-wider">{col.name}</span>
                  <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] px-2 py-0.5 rounded-full border border-[#E2E1DD]">
                    {colTasks.length}
                  </span>
                </div>
                
                {/* Scrollable list */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {colTasks.map(t => (
                    <div key={t.id} className="bg-[#FAF9F6] border border-[#E2E1DD] hover:border-[#FF3E3E]/30 rounded-xl p-3 space-y-3 transition-all group">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-extrabold text-[#5E6258] uppercase">{t.id}</span>
                          <span className={`px-1 rounded text-[7px] font-extrabold uppercase ${
                            t.priority === 'high' ? 'bg-[#FF3E3E]/10 text-[#FF3E3E] border border-[#FF3E3E]/20' : 'bg-[#FAF9F6] text-[#5E6258] border border-[#E2E1DD]'
                          }`}>{t.priority}</span>
                        </div>
                        <h4 className="text-xs font-bold text-black leading-tight mt-1 group-hover:text-[#FF3E3E] transition-colors">{t.title}</h4>
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-[#5E6258] border-t border-[#E2E1DD]/60 pt-2 shrink-0">
                        <span className="bg-[#10162F] border border-[#E2E1DD] px-1.5 py-0.5 rounded font-extrabold text-[8px] text-black">SP: {t.storyPoints}</span>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => removeTask(t.id)}
                            className="text-[#FF3E3E] hover:bg-[#FF3E3E]/10 p-1 rounded transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <div className="flex items-center gap-0.5">
                            {col.id !== 'todo' && (
                              <button 
                                onClick={() => moveTask(t.id, 'backward')}
                                className="text-[#5E6258] hover:text-black p-0.5 hover:bg-[#1E293B] rounded transition-colors"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button 
                                onClick={() => moveTask(t.id, 'forward')}
                                className="text-[#FF3E3E] hover:text-black p-0.5 hover:bg-[#1E293B] rounded transition-colors"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="h-full flex items-center justify-center py-12 text-[10px] text-[#5E6258] italic">
                      No cards in column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Backlog Form */}
        <div className="bg-white border border-[#E2E1DD] border border-[#E2E1DD] rounded-2xl p-5 h-fit space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#FF3E3E]" /> Backlog Ticket
          </h3>
          
          <form onSubmit={handleAddTask} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Task Summary</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Brief ticket description..."
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#FF3E3E] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Task Priority</label>
              <select 
                value={pri}
                onChange={(e) => setPri(e.target.value as any)}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-[#FF3E3E]"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Story Points (Estimation)</label>
              <input 
                type="number" 
                value={pts}
                onChange={(e) => setPts(e.target.value)}
                placeholder="3..."
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#FF3E3E] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-[#FF3E3E] hover:bg-[#FF3E3E]/80 text-xs font-bold text-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(255,62,62,0.1)]"
            >
              Push to Board
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
