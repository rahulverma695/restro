'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppState } from '@/context/StateContext';
import { 
  HelpCircle, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  AlertTriangle,
  Search,
  User,
  Send,
  ChevronRight,
  Shield,
  Activity,
  Terminal,
  Monitor
} from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

function HelpdeskContent() {
  const { 
    activeUser, 
    employees, 
    tickets, 
    comments, 
    addTicket, 
    addTicketComment, 
    changeTicketStatus, 
    changeTicketAssignment 
  } = useAppState();

  const searchParams = useSearchParams();
  const router = useRouter();
  
  const selectedId = searchParams.get('ticketId') || (tickets[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ticket Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'IT' | 'HR' | 'Finance' | 'Facility'>('IT');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDescription, setNewDescription] = useState('');
  
  // Comment State
  const [commentText, setCommentText] = useState('');
  
  // Troubleshooting checklist states
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    step1: true,
    step2: false,
    step3: false,
  });

  // Access check
  const hasAccess = activeUser.role === 'SuperAdmin' || activeUser.role === 'Manager' || activeUser.role === 'Employee';
  if (!hasAccess) {
    return <AccessDenied suite="IT & Service" role={activeUser.role} />;
  }

  const isManager = activeUser.role === 'SuperAdmin' || activeUser.role === 'Manager';

  const [now, setNow] = useState(new Date());
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTicketSlaRemaining = (t: typeof tickets[0]) => {
    if (t.status === 'resolved') {
      return { secondsLeft: Infinity, text: 'RESOLVED', isOverdue: false };
    }
    
    let createdDate = new Date(t.created_at);
    if (isNaN(createdDate.getTime())) {
      createdDate = new Date(t.created_at.replace(',', ''));
    }
    if (isNaN(createdDate.getTime())) {
      createdDate = new Date(now.getTime() - 60 * 60 * 1000);
    }
    
    let limitMinutes = 24 * 60; // low
    if (t.priority === 'high') limitMinutes = 2 * 60;
    else if (t.priority === 'medium') limitMinutes = 8 * 60;
    
    const limitMs = limitMinutes * 60 * 1000;
    const elapsedMs = now.getTime() - createdDate.getTime();
    const msLeft = limitMs - elapsedMs;
    
    if (msLeft < 0) {
      const absMs = Math.abs(msLeft);
      const hrs = Math.floor(absMs / 3600000);
      const mins = Math.floor((absMs % 3600000) / 60000);
      const secs = Math.floor((absMs % 60000) / 1000);
      return { 
        secondsLeft: msLeft / 1000, 
        text: `OVERDUE -${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`, 
        isOverdue: true 
      };
    } else {
      const hrs = Math.floor(msLeft / 3600000);
      const mins = Math.floor((msLeft % 3600000) / 60000);
      const secs = Math.floor((msLeft % 60000) / 1000);
      return { 
        secondsLeft: msLeft / 1000, 
        text: `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`, 
        isOverdue: false 
      };
    }
  };

  // Filter queue
  const myOrAllTickets = isManager 
    ? tickets 
    : tickets.filter(t => t.creator_id === activeUser.id);

  const filteredTickets = myOrAllTickets.filter(t => {
    const creator = employees.find(e => e.id === t.creator_id);
    const creatorName = creator ? `${creator.first_name} ${creator.last_name}` : '';
    return (
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creatorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (a.status === 'resolved' && b.status !== 'resolved') return 1;
    if (a.status !== 'resolved' && b.status === 'resolved') return -1;
    if (a.status === 'resolved' && b.status === 'resolved') return 0;
    
    const slaA = getTicketSlaRemaining(a);
    const slaB = getTicketSlaRemaining(b);
    return slaA.secondsLeft - slaB.secondsLeft;
  });

  // Selected Ticket details
  const selectedTicket = tickets.find(t => t.id === selectedId) || tickets[0];
  const ticketComments = comments.filter(c => c.ticket_id === selectedTicket?.id);
  const ticketCreator = selectedTicket ? employees.find(e => e.id === selectedTicket.creator_id) : null;
  const ticketAssignee = selectedTicket ? employees.find(e => e.id === selectedTicket.assigned_id) : null;

  // Handlers
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;
    addTicket(newCategory, newTitle, newDescription, newPriority);
    setNewTitle('');
    setNewDescription('');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !commentText.trim()) return;
    addTicketComment(selectedTicket.id, commentText.trim());
    setCommentText('');
  };

  const handleStatusChange = (status: 'open' | 'in_progress' | 'resolved') => {
    if (!selectedTicket) return;
    changeTicketStatus(selectedTicket.id, status);
  };

  const handleAssignment = (assignedId: string) => {
    if (!selectedTicket) return;
    changeTicketAssignment(selectedTicket.id, assignedId === '' ? null : assignedId);
  };

  const selectTicket = (id: string) => {
    router.push(`/it/helpdesk?ticketId=${id}`);
  };

  const toggleStep = (step: string) => {
    setChecklist(prev => ({ ...prev, [step]: !prev[step] }));
  };

  // Mock circular Urgency score matching screenshot's "Lead Score" circle
  const getUrgencyScore = (priority: string) => {
    if (priority === 'high') return { score: 92, grade: 'Priority Red', color: 'stroke-[#FF3E3E]' };
    if (priority === 'medium') return { score: 65, grade: 'Priority Orange', color: 'stroke-amber-500' };
    return { score: 30, grade: 'Priority Blue', color: 'stroke-[#00E5FF]' };
  };

  const urgency = selectedTicket ? getUrgencyScore(selectedTicket.priority) : { score: 45, grade: 'Normal', color: 'stroke-[#00E5FF]' };

  return (
    <div className="h-[calc(100vh-4rem)] flex select-none overflow-hidden bg-[#F4F3EF]">
      
      {/* 1. Left List Pane ("My Work" style ticket cards in #FAF9F6) */}
      <div className="w-80 border-r border-[#E2E1DD] flex flex-col h-full bg-[#FAF9F6]">
        {/* Search header */}
        <div className="p-4 border-b border-[#E2E1DD] space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-black uppercase tracking-wider">Helpdesk Tickets</span>
            <span className="text-[9px] text-[#5E6258] font-bold bg-[#EAE8E3] border border-[#E2E1DD] px-2 py-0.5 rounded-full">
              {filteredTickets.length} Queue
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5E6258]" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subjects, users..."
              className="w-full bg-white border border-[#E2E1DD] focus:border-[#FF3E3E] rounded-xl pl-9 pr-3 py-1.5 text-xs text-black focus:outline-none transition-all placeholder-[#8C9086]"
            />
          </div>
        </div>

        {/* Scrollable list items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-[#FAF9F6]">
          {sortedTickets.map((t) => {
            const isSelected = t.id === selectedId;
            const creator = employees.find(e => e.id === t.creator_id);
            const slaInfo = getTicketSlaRemaining(t);
            let priColor = 'bg-[#00E5FF]/10 border-[#00E5FF]/20 text-[#00E5FF]';
            if (t.priority === 'high') priColor = 'bg-[#FF3E3E]/10 border-[#FF3E3E]/20 text-[#FF3E3E]';
            if (t.priority === 'medium') priColor = 'bg-amber-400/10 border border-amber-400/20 text-amber-500';

            return (
              <button
                key={t.id}
                onClick={() => selectTicket(t.id)}
                className={`w-full flex flex-col p-3.5 rounded-xl transition-all duration-200 text-left border ${
                  isSelected
                    ? 'bg-white border-[#E2E1DD] text-black shadow-sm border-l-4 border-l-[#FF3E3E] font-extrabold'
                    : 'bg-transparent border-transparent hover:border-[#E2E1DD] text-[#5E6258] hover:text-black hover:bg-white/40'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-[8px] font-extrabold text-[#8C9086] uppercase font-mono">{t.id}</span>
                  <div className="flex items-center gap-1.5">
                    {t.status !== 'resolved' && (
                      <span className={`px-1 py-0.5 rounded text-[7px] font-extrabold uppercase border ${
                        slaInfo.isOverdue 
                          ? 'bg-[#FF3E3E]/10 border-[#FF3E3E]/20 text-[#FF3E3E]' 
                          : 'bg-[#3CD070]/10 border-[#3CD070]/20 text-[#3CD070]'
                      }`}>
                        SLA: {slaInfo.text}
                      </span>
                    )}
                    <span className={`px-1.5 py-0.2 rounded text-[7px] font-extrabold uppercase border ${priColor}`}>
                      {t.priority}
                    </span>
                  </div>
                </div>
                
                <h4 className="text-xs font-bold text-black mt-1.5 leading-snug group-hover:text-[#FF3E3E] transition-colors line-clamp-1">{t.title}</h4>
                
                <div className="flex items-center justify-between mt-3 text-[9px] text-[#5E6258] border-t border-[#E2E1DD]/40 pt-2 w-full font-bold uppercase tracking-wider">
                  <span>{t.category}</span>
                  <span>By {creator?.first_name} {creator?.last_name[0]}.</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Right Workspace Detailed Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F3EF]">
        {selectedTicket ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            
            {/* Upper Action Bar */}
            <div className="p-4 border-b border-[#E2E1DD] bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-black uppercase bg-[#E1FF4B] border border-[#C0D930] px-2.5 py-0.5 rounded-md">
                  Active Incident Details
                </span>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  className="bg-white border border-[#E2E1DD] rounded-lg px-2.5 py-1 text-[10px] text-black focus:outline-none focus:border-[#C0D930] uppercase font-extrabold tracking-wider"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                {isManager && (
                  <select 
                    value={selectedTicket.assigned_id || ''}
                    onChange={(e) => handleAssignment(e.target.value)}
                    className="bg-white border border-[#E2E1DD] rounded-lg px-2.5 py-1 text-[10px] text-black focus:outline-none focus:border-[#C0D930]"
                  >
                    <option value="">-- Unassigned --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.role})</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Profile Info Header */}
            <div className="px-6 py-4 border-b border-[#E2E1DD] bg-[#FAF9F6]/60 flex items-center gap-4 shrink-0 shadow-sm">
              <div className="h-11 w-11 bg-[#EAE8E3] border border-[#E2E1DD] rounded-xl flex items-center justify-center font-extrabold text-black text-sm shrink-0">
                {ticketCreator ? ticketCreator.first_name[0] : 'S'}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-black leading-tight">{selectedTicket.title}</h3>
                <p className="text-[10px] text-[#5E6258] font-bold uppercase mt-0.5">
                  Opened by: <span className="text-black font-extrabold">{ticketCreator ? `${ticketCreator.first_name} ${ticketCreator.last_name}` : 'Unknown'}</span> ({ticketCreator?.role}) • Created {selectedTicket.created_at}
                </p>
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Description & Details */}
                <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 space-y-4 shadow-sm">
                  <h3 className="text-[10px] font-extrabold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2">
                    Incident Description
                  </h3>
                  <div className="space-y-3">
                    <pre className="text-xs text-[#1A1C18] font-sans whitespace-pre-line leading-relaxed">
                      {selectedTicket.description}
                    </pre>
                    <div className="border-t border-[#E2E1DD]/60 pt-3 flex justify-between items-center text-[10px] text-[#5E6258] font-bold uppercase">
                      <span>Category: <span className="text-[#C0D930]">{selectedTicket.category}</span></span>
                      <span>Owner: <span className="text-black font-extrabold">{ticketAssignee ? `${ticketAssignee.first_name} ${ticketAssignee.last_name[0]}.` : 'None'}</span></span>
                    </div>
                  </div>
                </div>

                {/* Column 2: "Up Next" Troubleshooting Checklist */}
                <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 space-y-4 shadow-sm">
                  <h3 className="text-[10px] font-extrabold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2">
                    Up Next: Diagnostic Run
                  </h3>
                  <div className="space-y-3">
                    {/* Checklist Item 1 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={checklist.step1} 
                          onChange={() => toggleStep('step1')}
                          className="accent-black"
                        />
                        <span className={`font-semibold ${checklist.step1 ? 'line-through text-[#8C9086]' : 'text-black'}`}>Verify location & department</span>
                      </div>
                      <span className="text-[8px] bg-[#3CD070]/10 border border-[#3CD070]/20 text-[#3CD070] px-1.5 py-0.2 rounded font-extrabold uppercase">Pass</span>
                    </div>

                    {/* Checklist Item 2 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={checklist.step2} 
                          onChange={() => toggleStep('step2')}
                          className="accent-black"
                        />
                        <span className={`font-semibold ${checklist.step2 ? 'line-through text-[#8C9086]' : 'text-black'}`}>Inspect assigned asset logs</span>
                      </div>
                      <button 
                        onClick={() => alert('Operational Check: Related assets match active record.')}
                        className="text-[8px] border border-black/30 bg-black hover:bg-black/80 text-white px-1.5 py-0.5 rounded font-extrabold uppercase"
                      >
                        Verify
                      </button>
                    </div>

                    {/* Checklist Item 3 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={checklist.step3} 
                          onChange={() => toggleStep('step3')}
                          className="accent-black"
                        />
                        <span className={`font-semibold ${checklist.step3 ? 'line-through text-[#8C9086]' : 'text-black'}`}>Assign staff coordinator</span>
                      </div>
                      <span className="text-[8px] text-[#8C9086] font-bold uppercase">Pending</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Lead Score style circular Urgency Score */}
                <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex flex-col items-center justify-between text-center shadow-sm">
                  <h3 className="text-[10px] font-extrabold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2 w-full text-left">
                    Urgency Analysis
                  </h3>
                  
                  {/* Circle SVG */}
                  <div className="relative h-28 w-28 flex items-center justify-center my-2 shrink-0">
                    <svg className="h-full w-full transform -rotate-90">
                      <circle 
                        cx="56" 
                        cy="56" 
                        r="44" 
                        className="stroke-[#EAE8E3]" 
                        strokeWidth="8" 
                        fill="transparent" 
                      />
                      <circle 
                        cx="56" 
                        cy="56" 
                        r="44" 
                        className={urgency.color} 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={276}
                        strokeDashoffset={276 - (276 * urgency.score) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-black leading-none">{urgency.score}</span>
                      <span className="text-[8px] font-bold text-black uppercase tracking-wider mt-1">{urgency.grade}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-black">Incident Audit Level</p>
                    <p className="text-[9px] text-[#5E6258]">Automated risk arbitration matrix</p>
                  </div>
                </div>

              </div>

              {/* Bottom: Timeline Comments Chat */}
              <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E2E1DD]/60 pb-3">
                  <MessageSquare className="h-4 w-4 text-[#FF3E3E]" /> Chat Activity Feed ({ticketComments.length})
                </h3>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {ticketComments.map((c) => {
                    const sender = employees.find(e => e.id === c.sender_id);
                    return (
                      <div key={c.id} className="p-3.5 bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl space-y-1.5 hover:border-[#C0D930]/40 transition-colors">
                        <div className="flex items-center justify-between text-[8px] font-bold text-[#5E6258] uppercase tracking-wider">
                          <span className="text-black font-extrabold">{sender ? `${sender.first_name} ${sender.last_name}` : 'Staff'} ({sender?.role})</span>
                          <span>{c.created_at}</span>
                        </div>
                        <p className="text-xs text-[#5E6258] leading-relaxed">{c.message}</p>
                      </div>
                    );
                  })}
                  {ticketComments.length === 0 && (
                    <p className="text-xs text-[#5E6258] text-center py-6 italic">No timeline comment blocks logged.</p>
                  )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleCommentSubmit} className="flex gap-2 border-t border-[#E2E1DD] pt-4 shrink-0">
                  <input 
                    type="text" 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                    placeholder="Type comments, diagnostics updates..."
                    className="flex-1 bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-4 py-2 text-xs text-black focus:outline-none transition-all placeholder-[#8C9086]"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2.5 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-3 w-3" /> Reply
                  </button>
                </form>
              </div>

            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-sm text-[#5E6258]">
            <HelpCircle className="h-10 w-10 text-[#8C9086] mb-2 animate-bounce" />
            <p className="font-extrabold uppercase tracking-wider text-black">Select a Support Ticket</p>
            <p className="text-xs text-[#5E6258] mt-0.5">Use the listing index on the left to inspect detailed incident registers.</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default function HelpdeskPage() {
  return (
    <React.Suspense fallback={
      <div className="p-8 text-center text-xs text-[#5E6258] select-none font-bold uppercase tracking-wider animate-pulse">
        Loading Service Support Queue...
      </div>
    }>
      <HelpdeskContent />
    </React.Suspense>
  );
}
