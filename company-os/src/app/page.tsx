'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppState } from '@/context/StateContext';
import { 
  Clock, 
  Users, 
  HelpCircle, 
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  FileText,
  AlertTriangle,
  Play,
  Square,
  DollarSign,
  Laptop,
  CheckCircle,
  Activity,
  Plus,
  Trash2,
  Terminal,
  HardDrive,
  UserCheck,
  Megaphone,
  Briefcase,
  Key,
  Sliders,
  MapPin,
  ClipboardList,
  X
} from 'lucide-react';

export default function CommandDashboard() {
  const { activeUser } = useAppState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-8 text-center text-xs text-[#5E6258] font-bold uppercase tracking-wider animate-pulse bg-[#F4F3EF] min-h-screen flex items-center justify-center">
        Synchronizing Intranet Node Workspace...
      </div>
    );
  }

  // Dynamic Routing by Department & Role
  if (activeUser.role === 'SuperAdmin' || activeUser.department.startsWith('IT')) {
    return <ITDeptDashboard />;
  }
  
  if (activeUser.role === 'HRAdmin' || activeUser.department.startsWith('HR')) {
    return <HRDeptDashboard />;
  }

  if (activeUser.department === 'Finance') {
    return <FinanceDeptDashboard />;
  }

  if (activeUser.department === 'Engineering') {
    return <EngineeringDeptDashboard />;
  }

  // Fallback
  return <EngineeringDeptDashboard />;
}

// ==========================================
// FORCED NOTICE BOARD ACKNOWLEDGEMENT BANNER
// ==========================================
function NoticeAcknowledgeOverlay() {
  const { activeUser, announcements, acknowledgeAnnouncement } = useAppState();

  const unacknowledged = announcements.filter(
    a => !(a.acknowledged_by || []).includes(activeUser.id)
  );

  if (unacknowledged.length === 0) return null;

  // Render high-priority overlay banner for first unacknowledged notice
  const notice = unacknowledged[0];

  return (
    <div className="bg-black text-white border-2 border-[#FF3E3E] rounded-2xl p-5 space-y-3 shadow-2xl relative overflow-hidden animate-bounce">
      <div className="absolute top-0 right-0 bg-[#FF3E3E] text-white text-[8px] font-extrabold px-3 py-1 uppercase tracking-wider">
        High Priority Alert
      </div>
      <div className="flex items-center gap-2 text-[#FF3E3E]">
        <AlertTriangle className="h-5 w-5 animate-pulse" />
        <h3 className="text-xs font-extrabold uppercase tracking-wider">Forced Notice Acknowledgment</h3>
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-extrabold text-white">"{notice.title}"</h4>
        <p className="text-xs text-[#8C9086] leading-relaxed">{notice.content}</p>
      </div>
      <button
        onClick={() => acknowledgeAnnouncement(notice.id)}
        className="px-4 py-2 bg-[#E1FF4B] hover:bg-[#C0D930] text-black text-[9px] font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
      >
        I Acknowledge Notice
      </button>
    </div>
  );
}

// ==========================================
// 1. ENGINEERING DEPARTMENT DASHBOARD (John Doe)
// ==========================================
function EngineeringDeptDashboard() {
  const { 
    activeUser, 
    leaveRequests, 
    tickets, 
    clockInUser, 
    clockOutUser, 
    addLeaveRequest,
    projectTasks,
    toggleTaskTimer,
    changeTaskStage
  } = useAppState();
  
  const [clockNotes, setClockNotes] = useState('');
  
  // Quick Leave request states
  const [leaveType, setLeaveType] = useState<'sick' | 'casual' | 'annual'>('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Diagnostic Ping State
  const [pingTarget, setPingTarget] = useState('neon-db-core.internal');
  const [pingResult, setPingResult] = useState('');
  const [isPinging, setIsPinging] = useState(false);

  const isClockedIn = activeUser.status === 'online';
  const myLeaves = leaveRequests.filter(req => req.employee_id === activeUser.id);
  const myPendingLeaves = myLeaves.filter(req => req.status === 'pending');
  const myOpenTickets = tickets.filter(t => t.creator_id === activeUser.id && t.status !== 'resolved');
  const myTasks = projectTasks.filter(t => t.assignee_id === activeUser.id);
  const myActiveTasks = myTasks.filter(t => t.stage === 'inprogress');

  const handleClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clockInUser(clockNotes, { lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          clockInUser(clockNotes, { lat: 12.9716, lng: 77.5946 });
        }
      );
    } else {
      clockInUser(clockNotes, { lat: 12.9716, lng: 77.5946 });
    }
    setClockNotes('');
  };

  const handleClockOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clockNotes.trim()) {
      alert('Handover notes are mandatory for 24/7 roles clock-out.');
      return;
    }
    clockOutUser(clockNotes);
    setClockNotes('');
  };

  const handleQuickLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;
    addLeaveRequest(leaveType, startDate, endDate, reason.trim());
    setStartDate('');
    setEndDate('');
    setReason('');
    alert('Leave request submitted to supervisor queue!');
  };

  const handlePing = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPinging(true);
    setPingResult('Pinging internal cluster Node 4...');
    setTimeout(() => {
      setPingResult(`Diagnostics complete. ${pingTarget} latency: 8ms. Packet loss: 0%. Status: stable.`);
      setIsPinging(false);
    }, 700);
  };

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF]">
      
      {/* Notice Board Forced Acknowledgement */}
      <NoticeAcknowledgeOverlay />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E1DD] pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Engineering Terminal</h2>
          <p className="text-sm text-[#5E6258]">Manage assigned agile sprints, log billable timers, and monitor system diagnostics.</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-extrabold text-[#5E6258] uppercase tracking-wider bg-white px-3 py-1.5 rounded-lg border border-[#E2E1DD]">
            Shift Status: {isClockedIn ? 'ONLINE (ON DUTY)' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">My Shift Logs</span>
            <p className="text-2xl font-extrabold text-[#1A1C18]">{isClockedIn ? 'Active' : 'Offline'}</p>
            <p className="text-[9px] text-[#5E6258] font-bold">
              {isClockedIn ? 'Clocked in today' : 'No active shift log'}
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${isClockedIn ? 'bg-[#3CD070]/10 text-[#3CD070] border-[#3CD070]/20' : 'bg-[#FF3E3E]/10 text-[#FF3E3E] border-[#FF3E3E]/20'}`}>
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Active Sprints</span>
            <p className="text-2xl font-extrabold text-[#1A1C18]">{myActiveTasks.length} In Progress</p>
            <p className="text-[9px] text-[#5E6258] font-bold uppercase">{myTasks.length} tasks total</p>
          </div>
          <div className="bg-[#8B5CF6]/10 p-3 rounded-xl text-[#8B5CF6] border border-[#8B5CF6]/20">
            <Briefcase className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Open IT Tickets</span>
            <p className="text-2xl font-extrabold text-[#1A1C18]">{myOpenTickets.length} Raised</p>
            <p className="text-[9px] text-[#FF3E3E] font-bold">IT Support requests</p>
          </div>
          <div className="bg-[#FF3E3E]/10 p-3 rounded-xl text-[#FF3E3E] border border-[#FF3E3E]/20">
            <HelpCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Node Uptime</span>
            <p className="text-2xl font-extrabold text-[#1A1C18]">99.98%</p>
            <p className="text-[9px] text-[#3CD070] font-bold">Stable Connection</p>
          </div>
          <div className="bg-[#3CD070]/10 p-3 rounded-xl text-[#3CD070] border border-[#3CD070]/20">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          
          {/* Shift Controller */}
          <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-3 text-black border-b border-[#E2E1DD] pb-3">
              <Clock className="h-5 w-5 text-[#C0D930] animate-pulse" />
              <h3 className="text-xs font-extrabold text-[#1A1C18] uppercase tracking-wider">Geofenced Check-in</h3>
            </div>

            {isClockedIn ? (
              <div className="space-y-4 bg-[#3CD070]/5 border border-[#3CD070]/20 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#3CD070] animate-ping"></span>
                  <span className="text-xs font-bold text-[#3CD070] uppercase tracking-wider">Shift Active</span>
                </div>
                <p className="text-[9px] text-[#5E6258] font-bold uppercase">Location: Bangalore HQ Office Bay</p>

                <form onSubmit={handleClockOut} className="space-y-3">
                  <input 
                    type="text" 
                    value={clockNotes}
                    onChange={(e) => setClockNotes(e.target.value)}
                    required
                    placeholder="Handover notes (Mandatory)..."
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#FF3E3E] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                  />
                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF3E3E] hover:bg-[#FF3E3E]/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" /> Stop Shift Log
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-4 bg-[#FF3E3E]/5 border border-[#FF3E3E]/20 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#FF3E3E]"></span>
                  <span className="text-xs font-bold text-[#FF3E3E] uppercase tracking-wider">Shift Inactive (Offline)</span>
                </div>

                <form onSubmit={handleClockIn} className="space-y-3">
                  <input 
                    type="text" 
                    value={clockNotes}
                    onChange={(e) => setClockNotes(e.target.value)}
                    placeholder="Shift start notes..."
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                  />
                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> Initialize Shift
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Telemetry diagnostics */}
          <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#C0D930]" /> Cluster Latency Tool
            </h3>
            <form onSubmit={handlePing} className="space-y-3 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#5E6258]">Neon DB Endpoint</label>
                <input 
                  type="text" 
                  value={pingTarget}
                  onChange={(e) => setPingTarget(e.target.value)}
                  required
                  placeholder="e.g. pg.omnihub.com..."
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={isPinging}
                className="w-full py-2 bg-black hover:bg-black/90 disabled:bg-black/60 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {isPinging ? 'Pinging...' : 'Test Connection'}
              </button>
              {pingResult && (
                <div className="p-3 bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl font-mono text-[9px] text-[#5E6258] leading-tight break-all">
                  {pingResult}
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Right Columns (Spans 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Sprint Tasks with timers */}
          <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">My Agile Sprint Tasks</h3>
            
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div key={task.id} className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#C0D930]/30 transition-colors shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        task.priority === 'high' 
                          ? 'bg-[#FF3E3E]/10 text-[#FF3E3E] border border-[#FF3E3E]/20'
                          : task.priority === 'medium'
                          ? 'bg-amber-400/10 text-amber-500 border border-amber-400/20'
                          : 'bg-[#8C9086]/10 text-[#5E6258] border border-[#8C9086]/20'
                      }`}>
                        {task.priority} Priority
                      </span>
                      <span className="text-[8px] font-bold text-[#8C9086] uppercase">
                        Stage: {task.stage}
                      </span>
                    </div>
                    <h4 className="text-xs font-extrabold text-[#1A1C18] leading-snug">{task.title}</h4>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#E2E1DD] pt-3 sm:pt-0">
                    <div className="text-right">
                      <span className="text-[8px] font-bold text-[#8C9086] uppercase block">Logged Hours</span>
                      <span className={`text-xs font-mono font-bold ${task.timer_active ? 'text-[#3CD070] font-extrabold animate-pulse' : 'text-black'}`}>
                        {formatDuration(task.time_spent)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        value={task.stage}
                        onChange={(e) => changeTaskStage(task.id, e.target.value as any)}
                        className="bg-white border border-[#E2E1DD] rounded-lg text-[10px] font-bold p-1 focus:outline-none"
                      >
                        <option value="todo">To Do</option>
                        <option value="inprogress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      
                      <button 
                        onClick={() => toggleTaskTimer(task.id)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1 ${
                          task.timer_active 
                            ? 'bg-[#FF3E3E]/10 border-[#FF3E3E]/30 text-[#FF3E3E] hover:bg-[#FF3E3E]/20' 
                            : 'bg-[#E1FF4B] border-[#C0D930] text-black hover:bg-[#C0D930]'
                        }`}
                      >
                        {task.timer_active ? (
                          <>
                            <Square className="h-2.5 w-2.5 fill-current" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-2.5 w-2.5 fill-current" /> Start
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {myTasks.length === 0 && (
                <p className="text-xs text-[#8C9086] italic text-center py-6">No sprint tasks assigned to your node.</p>
              )}
            </div>
          </div>

          {/* Quick Leave Request form */}
          <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">Quick Leave Request</h3>
            
            <form onSubmit={handleQuickLeave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#5E6258]">Leave Type</label>
                <select 
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                >
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="annual">Annual Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#5E6258]">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-2 py-1.5 text-xs text-black focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#5E6258]">End Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-2 py-1.5 text-xs text-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#5E6258]">Reason</label>
                <input 
                  type="text" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="Reason for leave request..."
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button 
                  type="submit"
                  className="w-full py-2 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>

          {/* Leaves History */}
          <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider border-b border-[#E2E1DD] pb-3">My Leave Requests</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E1DD] text-[10px] font-bold uppercase tracking-wider text-[#5E6258]">
                    <th className="py-2.5 px-4">Leave Type</th>
                    <th className="py-2.5 px-4">Dates</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E1DD]/40 text-xs text-[#5E6258]">
                  {myLeaves.map((req) => (
                    <tr key={req.id}>
                      <td className="py-3 px-4 font-bold capitalize text-black">{req.leave_type}</td>
                      <td className="py-3 px-4">{req.start_date} to {req.end_date}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          req.status === 'approved'
                            ? 'bg-[#3CD070]/10 text-[#3CD070] border border-[#3CD070]/20'
                            : req.status === 'rejected'
                            ? 'bg-[#FF3E3E]/10 text-[#FF3E3E] border-[#FF3E3E]/20'
                            : 'bg-amber-400/10 text-amber-500 border border-amber-400/20'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

// ==========================================
// 2. HR OPERATIONS ADMIN DASHBOARD (Nikhil)
// ==========================================
// ==========================================
// 2. HR OPERATIONS DEPARTMENT DASHBOARD (Nikhil)
// ==========================================
function HRDeptDashboard() {
  const { 
    activeUser, 
    employees, 
    leaveRequests, 
    announcements, 
    clockInUser, 
    clockOutUser, 
    approveLeaveRequest, 
    postAnnouncement,
    addLeaveRequest
  } = useAppState();
  
  const [clockNotes, setClockNotes] = useState('');
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // Employee leaves form states
  const [leaveType, setLeaveType] = useState<'sick' | 'casual' | 'annual'>('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const isClockedIn = activeUser.status === 'online';
  const onlineCount = employees.filter(e => e.status === 'online').length;
  const leaveCount = employees.filter(e => e.status === 'on_leave').length;
  const pendingLeaves = leaveRequests.filter(req => req.status === 'pending');

  const myLeaves = leaveRequests.filter(req => req.employee_id === activeUser.id);
  const myPendingLeaves = myLeaves.filter(req => req.status === 'pending');

  const isHRManagerOrAdmin = activeUser.role === 'HRAdmin' || activeUser.role === 'SuperAdmin' || activeUser.role === 'Manager';

  const handleClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    clockInUser(clockNotes, { lat: 12.9716, lng: 77.5946 });
    setClockNotes('');
  };

  const handleClockOut = (e: React.FormEvent) => {
    e.preventDefault();
    clockOutUser(clockNotes);
    setClockNotes('');
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    postAnnouncement(annTitle, annContent);
    setAnnTitle('');
    setAnnContent('');
    alert('Notice broadcasted successfully to all staff dashboards!');
  };

  const handleQuickLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;
    addLeaveRequest(leaveType, startDate, endDate, reason.trim());
    setStartDate('');
    setEndDate('');
    setReason('');
    alert('Leave request submitted to supervisor queue!');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E1DD] pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">
            {isHRManagerOrAdmin ? 'HR Operations Portal' : 'HR Employee Self-Service'}
          </h2>
          <p className="text-sm text-[#5E6258]">
            {isHRManagerOrAdmin 
              ? 'Corporate attendance tracking, leaves clearances, and announcements broadcasting.'
              : 'Submit leaves requests, log shift timings, and review Handbooks.'}
          </p>
        </div>
        {!isHRManagerOrAdmin && (
          <div className="text-right shrink-0">
            <span className="text-xs font-extrabold text-[#5E6258] uppercase tracking-wider bg-white px-3 py-1.5 rounded-lg border border-[#E2E1DD]">
              Shift Status: {isClockedIn ? 'ONLINE (ON DUTY)' : 'OFFLINE'}
            </span>
          </div>
        )}
      </div>

      {isHRManagerOrAdmin ? (
        /* HR ADMIN / MANAGER VIEW */
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Total Headcount</span>
                <p className="text-2xl font-extrabold text-[#1A1C18]">{employees.length} Workers</p>
              </div>
              <div className="bg-[#E1FF4B]/30 p-3 rounded-xl text-black border border-[#C0D930]/30 shadow-sm">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Active Shifts Online</span>
                <p className="text-2xl font-extrabold text-[#3CD070]">{onlineCount} Active</p>
              </div>
              <div className="bg-[#3CD070]/10 p-3 rounded-xl text-[#3CD070] border border-[#3CD070]/20">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Pending Leaves Approvals</span>
                <p className="text-2xl font-extrabold text-[#1A1C18]">{pendingLeaves.length} Pending</p>
              </div>
              <div className="bg-[#8B5CF6]/10 p-3 rounded-xl text-[#8B5CF6] border border-[#8B5CF6]/20">
                <Calendar className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Staff on Leave</span>
                <p className="text-2xl font-extrabold text-black">{leaveCount} Absent</p>
              </div>
              <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E2E1DD]">
                <Users className="h-5 w-5 text-black" />
              </div>
            </div>
          </div>

          {/* Splits */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Broadcaster */}
              <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E1DD] pb-3">
                  <Megaphone className="h-4 w-4 text-[#C0D930]" /> Notice Board Broadcaster
                </h3>
                <form onSubmit={handleBroadcast} className="space-y-3 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[#5E6258]">Notice Title</label>
                    <input 
                      type="text" 
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      required
                      placeholder="e.g. Office closure details..."
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[#5E6258]">Notice Body</label>
                    <textarea 
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      required
                      rows={3}
                      placeholder="Enter notice text broadcasted to all..."
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all resize-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Broadcast Notice
                  </button>
                </form>
              </div>
            </div>

            {/* Right Columns */}
            <div className="lg:col-span-2 space-y-8">
              {/* Leave approvals queue */}
              <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">Leave Approvals Queue</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pendingLeaves.map(req => {
                    const applicant = employees.find(e => e.id === req.employee_id);
                    return (
                      <div key={req.id} className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-black">
                            <span className="font-extrabold">{applicant?.first_name} {applicant?.last_name}</span>
                            <span className="text-[8px] font-extrabold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 px-2 py-0.5 rounded uppercase">{req.leave_type}</span>
                          </div>
                          <p className="text-[9px] text-[#8C9086] font-semibold">{req.start_date} to {req.end_date}</p>
                          <p className="text-xs text-[#5E6258] italic">"{req.reason}"</p>
                        </div>

                        <div className="flex gap-2 border-t border-[#E2E1DD]/70 pt-2.5">
                          <button 
                            onClick={() => approveLeaveRequest(req.id, 'approved')}
                            className="flex-1 py-1.5 bg-[#3CD070]/10 border border-[#3CD070]/20 hover:bg-[#3CD070]/20 text-[#3CD070] text-[9px] font-extrabold uppercase rounded-lg cursor-pointer"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => approveLeaveRequest(req.id, 'rejected')}
                            className="flex-1 py-1.5 bg-[#FF3E3E]/10 border border-[#FF3E3E]/20 hover:bg-[#FF3E3E]/20 text-[#FF3E3E] text-[9px] font-extrabold uppercase rounded-lg cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {pendingLeaves.length === 0 && (
                    <p className="text-xs text-[#8C9086] italic col-span-2 text-center py-6">All leave requests reviewed.</p>
                  )}
                </div>
              </div>

              {/* Presence Registry */}
              <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">Presence Register</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E1DD] text-[10px] font-bold uppercase tracking-wider text-[#5E6258]">
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Department</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E1DD]/40 text-xs text-[#5E6258]">
                      {employees.map(emp => (
                        <tr key={emp.id} className="hover:bg-[#FAF9F6]">
                          <td className="py-2.5 px-3 font-bold text-black">{emp.first_name} {emp.last_name}</td>
                          <td className="py-2.5 px-3">{emp.department}</td>
                          <td className="py-2.5 px-3 flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${emp.status === 'online' ? 'bg-[#3CD070]' : emp.status === 'on_leave' ? 'bg-[#8B5CF6]' : 'bg-[#8C9086]'}`} />
                            <span className="capitalize">{emp.status.replace('_', ' ')}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* HR EMPLOYEE SELF-SERVICE VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Shift Controller */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-3 text-black border-b border-[#E2E1DD] pb-3">
                <Clock className="h-5 w-5 text-[#C0D930] animate-pulse" />
                <h3 className="text-xs font-extrabold text-[#1A1C18] uppercase tracking-wider">Geofenced Check-in</h3>
              </div>

              {isClockedIn ? (
                <div className="space-y-4 bg-[#3CD070]/5 border border-[#3CD070]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#3CD070] animate-ping"></span>
                    <span className="text-xs font-bold text-[#3CD070] uppercase tracking-wider">Shift Active</span>
                  </div>
                  <p className="text-[9px] text-[#5E6258] font-bold uppercase">Location: Bangalore HQ Office Bay</p>

                  <form onSubmit={handleClockOut} className="space-y-3">
                    <input 
                      type="text" 
                      value={clockNotes}
                      onChange={(e) => setClockNotes(e.target.value)}
                      required
                      placeholder="Handover notes (Mandatory)..."
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#FF3E3E] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                    />
                    <button 
                      type="submit" 
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF3E3E] hover:bg-[#FF3E3E]/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      <Square className="h-3.5 w-3.5 fill-current" /> Stop Shift Log
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4 bg-[#FF3E3E]/5 border border-[#FF3E3E]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#FF3E3E]"></span>
                    <span className="text-xs font-bold text-[#FF3E3E] uppercase tracking-wider">Shift Inactive (Offline)</span>
                  </div>

                  <form onSubmit={handleClockIn} className="space-y-3">
                    <input 
                      type="text" 
                      value={clockNotes}
                      onChange={(e) => setClockNotes(e.target.value)}
                      placeholder="Shift start notes..."
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                    />
                    <button 
                      type="submit" 
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> Initialize Shift
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Attendance Metrics */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">My Leave Allowances</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAF9F6] border border-[#E2E1DD] p-3.5 rounded-xl text-center">
                  <span className="text-[20px] font-extrabold text-black">8 Days</span>
                  <p className="text-[8px] text-[#8C9086] font-extrabold uppercase mt-1">Sick Leave</p>
                </div>
                <div className="bg-[#FAF9F6] border border-[#E2E1DD] p-3.5 rounded-xl text-center">
                  <span className="text-[20px] font-extrabold text-black">12 Days</span>
                  <p className="text-[8px] text-[#8C9086] font-extrabold uppercase mt-1">Casual Leave</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns (Spans 2) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Leave Request form */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">Quick Leave Request</h3>
              
              <form onSubmit={handleQuickLeave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#5E6258]">Leave Type</label>
                  <select 
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                  >
                    <option value="sick">Sick Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="annual">Annual Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[#5E6258]">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-2 py-1.5 text-xs text-black focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[#5E6258]">End Date</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-2 py-1.5 text-xs text-black focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#5E6258]">Reason</label>
                  <input 
                    type="text" 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Reason for leave request..."
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button 
                    type="submit"
                    className="w-full py-2 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Submit Leave Request
                  </button>
                </div>
              </form>
            </div>

            {/* Leaves History */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider border-b border-[#E2E1DD] pb-3">My Leave Requests</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E1DD] text-[10px] font-bold uppercase tracking-wider text-[#5E6258]">
                      <th className="py-2.5 px-4">Leave Type</th>
                      <th className="py-2.5 px-4">Dates</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E1DD]/40 text-xs text-[#5E6258]">
                    {myLeaves.map((req) => (
                      <tr key={req.id}>
                        <td className="py-3 px-4 font-bold capitalize text-black">{req.leave_type}</td>
                        <td className="py-3 px-4">{req.start_date} to {req.end_date}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            req.status === 'approved'
                              ? 'bg-[#3CD070]/10 text-[#3CD070] border border-[#3CD070]/20'
                              : req.status === 'rejected'
                              ? 'bg-[#FF3E3E]/10 text-[#FF3E3E] border-[#FF3E3E]/20'
                              : 'bg-amber-400/10 text-amber-500 border border-amber-400/20'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. FINANCE MANAGER DASHBOARD (Jane Smith)
// ==========================================
function FinanceDeptDashboard() {
  const { 
    activeUser, 
    receiptClaims, 
    saasVendors, 
    approveReceiptClaim, 
    employees, 
    addReceiptClaim,
    clockInUser,
    clockOutUser,
    leaveRequests,
    addLeaveRequest
  } = useAppState();

  const [clockNotes, setClockNotes] = useState('');
  
  // Quick Expense Submission State
  const [expenseItem, setExpenseItem] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Software SaaS');

  // Quick Leave request states
  const [leaveType, setLeaveType] = useState<'sick' | 'casual' | 'annual'>('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const isClockedIn = activeUser.status === 'online';
  const isFinanceManager = activeUser.role === 'Manager' || activeUser.role === 'SuperAdmin' || activeUser.role === 'HRAdmin';
  const totalBurn = saasVendors.reduce((sum, v) => sum + v.cost, 0);
  const pendingClaims = receiptClaims.filter(c => c.status === 'pending');
  const myClaims = receiptClaims.filter(c => c.employee_id === activeUser.id);

  const handleClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    clockInUser(clockNotes, { lat: 12.9716, lng: 77.5946 });
    setClockNotes('');
  };

  const handleClockOut = (e: React.FormEvent) => {
    e.preventDefault();
    clockOutUser(clockNotes);
    setClockNotes('');
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(expenseAmount);
    if (!expenseItem.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;
    addReceiptClaim(expenseItem.trim(), parsedAmount, expenseCategory);
    setExpenseItem('');
    setExpenseAmount('');
    alert('Reimbursement claim logged for audit!');
  };

  const handleQuickLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;
    addLeaveRequest(leaveType, startDate, endDate, reason.trim());
    setStartDate('');
    setEndDate('');
    setReason('');
    alert('Leave request submitted to supervisor queue!');
  };

  const myLeaves = leaveRequests.filter(req => req.employee_id === activeUser.id);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E1DD] pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">
            {isFinanceManager ? 'Finance Operations Hub' : 'Expense & Reimbursements'}
          </h2>
          <p className="text-sm text-[#5E6258]">
            {isFinanceManager 
              ? 'Audit employee reimbursement claims and monitor company-wide SaaS runrates.'
              : 'File new expense reimbursement claims and audit your historical requests.'}
          </p>
        </div>
        {!isFinanceManager && (
          <div className="text-right shrink-0">
            <span className="text-xs font-extrabold text-[#5E6258] uppercase tracking-wider bg-white px-3 py-1.5 rounded-lg border border-[#E2E1DD]">
              Shift Status: {isClockedIn ? 'ONLINE (ON DUTY)' : 'OFFLINE'}
            </span>
          </div>
        )}
      </div>

      {isFinanceManager ? (
        /* FINANCE MANAGER VIEW */
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Active SaaS Vendors</span>
                <p className="text-2xl font-extrabold text-black">{saasVendors.length} Subscriptions</p>
              </div>
              <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E2E1DD]">
                <Activity className="h-5 w-5 text-black" />
              </div>
            </div>

            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Monthly SaaS Burn</span>
                <p className="text-2xl font-extrabold text-[#FF3E3E]">${totalBurn.toLocaleString()}/mo</p>
              </div>
              <div className="bg-[#FF3E3E]/10 p-2.5 rounded-xl border border-[#FF3E3E]/20 text-[#FF3E3E]">
                <TrendingUp className="h-5 w-5 animate-pulse" />
              </div>
            </div>

            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Pending Receipts Audits</span>
                <p className="text-2xl font-extrabold text-black">{pendingClaims.length} Pending</p>
              </div>
              <div className="bg-amber-400/10 p-2.5 rounded-xl border border-amber-400/20 text-amber-500">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Splits */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Receipts queue */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E1DD] pb-3">
                <ClipboardList className="h-4 w-4 text-[#8B5CF6]" /> Expense Reimbursements Approvals Queue
              </h3>

              <div className="space-y-4">
                {pendingClaims.map(claim => {
                  const staff = employees.find(e => e.id === claim.employee_id);
                  return (
                    <div key={claim.id} className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] text-black">
                          <span className="font-extrabold">{staff?.first_name} {staff?.last_name}</span>
                          <span className="text-[8px] font-extrabold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 px-2 py-0.5 rounded uppercase">{claim.category}</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-[#5E6258]">"{claim.item}"</h4>
                        <p className="text-[8px] text-[#8C9086] font-semibold">{claim.date}</p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#E2E1DD] pt-3 sm:pt-0">
                        <div>
                          <span className="text-[8px] font-bold text-[#8C9086] uppercase block">Amount</span>
                          <span className="text-sm font-extrabold text-black">${claim.amount.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => approveReceiptClaim(claim.id, 'approved')}
                            className="h-8 w-8 bg-black border border-[#C0D930]/30 text-[#3CD070] rounded-xl flex items-center justify-center hover:bg-black/80 cursor-pointer transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => approveReceiptClaim(claim.id, 'rejected')}
                            className="h-8 w-8 bg-[#FF3E3E]/10 border border-[#FF3E3E]/30 text-[#FF3E3E] rounded-xl flex items-center justify-center hover:bg-[#FF3E3E]/20 cursor-pointer transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {pendingClaims.length === 0 && (
                  <p className="text-xs text-[#8C9086] italic text-center py-6 bg-white border border-[#E2E1DD] rounded-2xl shadow-sm">All receipts audited successfully.</p>
                )}
              </div>
            </div>

            {/* Right Column: Vendor SaaS Burn */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm h-fit">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">SaaS Burn Register</h3>
              <div className="space-y-3">
                {saasVendors.map(vendor => (
                  <div key={vendor.id} className="p-3 bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-black">{vendor.name}</h4>
                      <span className="text-[7px] text-[#8C9086] font-bold uppercase block mt-0.5">Renews: {vendor.renewal_date}</span>
                    </div>
                    <span className="font-extrabold text-black">${vendor.cost.toLocaleString()}/mo</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      ) : (
        /* FINANCE EMPLOYEE PORTAL VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Clock, Expense Claim, and Leave Request forms */}
          <div className="space-y-8">
            {/* Shift Logs */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-3 text-black border-b border-[#E2E1DD] pb-3">
                <Clock className="h-5 w-5 text-[#C0D930] animate-pulse" />
                <h3 className="text-xs font-extrabold text-[#1A1C18] uppercase tracking-wider">Geofenced Check-in</h3>
              </div>

              {isClockedIn ? (
                <div className="space-y-4 bg-[#3CD070]/5 border border-[#3CD070]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#3CD070] animate-ping"></span>
                    <span className="text-xs font-bold text-[#3CD070] uppercase tracking-wider">Shift Active</span>
                  </div>
                  <p className="text-[9px] text-[#5E6258] font-bold uppercase">Location: Bangalore HQ Office Bay</p>

                  <form onSubmit={handleClockOut} className="space-y-3">
                    <input 
                      type="text" 
                      value={clockNotes}
                      onChange={(e) => setClockNotes(e.target.value)}
                      required
                      placeholder="Handover notes (Mandatory)..."
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#FF3E3E] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                    />
                    <button 
                      type="submit" 
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF3E3E] hover:bg-[#FF3E3E]/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      <Square className="h-3.5 w-3.5 fill-current" /> Stop Shift Log
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4 bg-[#FF3E3E]/5 border border-[#FF3E3E]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#FF3E3E]"></span>
                    <span className="text-xs font-bold text-[#FF3E3E] uppercase tracking-wider">Shift Inactive (Offline)</span>
                  </div>

                  <form onSubmit={handleClockIn} className="space-y-3">
                    <input 
                      type="text" 
                      value={clockNotes}
                      onChange={(e) => setClockNotes(e.target.value)}
                      placeholder="Shift start notes..."
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                    />
                    <button 
                      type="submit" 
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> Initialize Shift
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Quick claim form */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">Submit Reimbursement</h3>
              <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#5E6258]">Category</label>
                  <select 
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                  >
                    <option value="Software SaaS">Software SaaS</option>
                    <option value="Hardware">Hardware Supplies</option>
                    <option value="Travel">Travel Reimbursements</option>
                    <option value="Meals & Ent">Meals & Entertainment</option>
                    <option value="Office Supp">Office Supplies</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#5E6258]">Expense Item Name</label>
                  <input 
                    type="text" 
                    value={expenseItem}
                    onChange={(e) => setExpenseItem(e.target.value)}
                    required
                    placeholder="e.g. Remote Office Monitor Setup..."
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#5E6258]">Amount (USD)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-2 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  File Expense Claim
                </button>
              </form>
            </div>

            {/* Quick Leave Request form */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">Quick Leave Request</h3>
              <form onSubmit={handleQuickLeave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#5E6258]">Leave Type</label>
                  <select 
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                  >
                    <option value="sick">Sick Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="annual">Annual Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[#5E6258]">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-2 py-1.5 text-xs text-black focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[#5E6258]">End Date</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-2 py-1.5 text-xs text-black focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#5E6258]">Reason</label>
                  <input 
                    type="text" 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Reason for leave request..."
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button 
                    type="submit"
                    className="w-full py-2 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Submit Leave Request
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Claims History & Leave Requests */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm h-fit">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">My Historical Reimbursement Logs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E1DD] text-[10px] font-bold uppercase tracking-wider text-[#5E6258]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Item Details</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E1DD]/40 text-xs text-[#5E6258]">
                    {myClaims.map(claim => (
                      <tr key={claim.id} className="hover:bg-[#FAF9F6]">
                        <td className="py-3 px-3">{claim.date}</td>
                        <td className="py-3 px-3 font-bold text-black">{claim.item}</td>
                        <td className="py-3 px-3 font-bold uppercase text-[9px]">{claim.category}</td>
                        <td className="py-3 px-3 font-semibold text-black">${claim.amount.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            claim.status === 'approved'
                              ? 'bg-[#3CD070]/10 text-[#3CD070] border border-[#3CD070]/20'
                              : claim.status === 'rejected'
                              ? 'bg-[#FF3E3E]/10 text-[#FF3E3E] border-[#FF3E3E]/20'
                              : 'bg-amber-400/10 text-amber-500 border border-amber-400/20'
                          }`}>
                            {claim.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {myClaims.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center italic text-[#8C9086]">No historical receipt claims logged.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leaves History */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider border-b border-[#E2E1DD] pb-3">My Leave Requests</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E1DD] text-[10px] font-bold uppercase tracking-wider text-[#5E6258]">
                      <th className="py-2.5 px-4">Leave Type</th>
                      <th className="py-2.5 px-4">Dates</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E1DD]/40 text-xs text-[#5E6258]">
                    {myLeaves.map((req) => (
                      <tr key={req.id}>
                        <td className="py-3 px-4 font-bold capitalize text-black">{req.leave_type}</td>
                        <td className="py-3 px-4">{req.start_date} to {req.end_date}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            req.status === 'approved'
                              ? 'bg-[#3CD070]/10 text-[#3CD070] border border-[#3CD070]/20'
                              : req.status === 'rejected'
                              ? 'bg-[#FF3E3E]/10 text-[#FF3E3E] border-[#FF3E3E]/20'
                              : 'bg-amber-400/10 text-amber-500 border border-amber-400/20'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {myLeaves.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-6 text-center italic text-[#8C9086]">No leave requests submitted yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. SUPERADMIN / IT MANAGER DASHBOARD
// ==========================================
// ==========================================
// 4. IT OPERATIONS / SERVICE DESK DASHBOARD (Alex Johnson)
// ==========================================
function ITDeptDashboard() {
  const { activeUser, tickets, systemAuditLogs, clockInUser, clockOutUser, shifts, leaveRequests, addLeaveRequest } = useAppState();
  const [clockNotes, setClockNotes] = useState('');
  const [pingTarget, setPingTarget] = useState('api.omnihub.com');
  const [pingResult, setPingResult] = useState('');
  const [isPinging, setIsPinging] = useState(false);

  // Quick Leave request states
  const [leaveType, setLeaveType] = useState<'sick' | 'casual' | 'annual'>('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const isClockedIn = activeUser.status === 'online';
  const openTicketsCount = tickets.filter(t => t.status !== 'resolved').length;
  const highPriorityTickets = tickets.filter(t => t.priority === 'high' && t.status !== 'resolved');
  const isITManagerOrAdmin = activeUser.role === 'SuperAdmin' || activeUser.role === 'Manager' || activeUser.role === 'HRAdmin';
  
  const myOpenTickets = tickets.filter(t => t.creator_id === activeUser.id);
  const myShiftsHandoverHistory = shifts.filter(s => s.employee_id === activeUser.id && s.notes);

  const handleClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    clockInUser(clockNotes, { lat: 12.9716, lng: 77.5946 });
    setClockNotes('');
  };

  const handleClockOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clockNotes.trim()) {
      alert('Handover notes are mandatory for 24/7 roles clock-out.');
      return;
    }
    clockOutUser(clockNotes);
    setClockNotes('');
  };

  const handleQuickLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;
    addLeaveRequest(leaveType, startDate, endDate, reason.trim());
    setStartDate('');
    setEndDate('');
    setReason('');
    alert('Leave request submitted to supervisor queue!');
  };

  const myLeaves = leaveRequests.filter(req => req.employee_id === activeUser.id);

  const runDiagnosticPing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pingTarget) return;
    setIsPinging(true);
    setPingResult('Pinging target server...');
    setTimeout(() => {
      setPingResult(`Diagnostics complete. ${pingTarget} latency: 12ms. Status: 0% Packet Loss.`);
      setIsPinging(false);
    }, 700);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E1DD] pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">
            {isITManagerOrAdmin ? 'IT Command Center' : 'IT Service Desk & Shift Portal'}
          </h2>
          <p className="text-sm text-[#5E6258]">
            {isITManagerOrAdmin 
              ? 'System diagnostic panels, global audit log ledgers, and operational support tickets.'
              : 'Submit support requests, log handovers, and run connection diagnostics.'}
          </p>
        </div>
        {!isITManagerOrAdmin && (
          <div className="text-right shrink-0">
            <span className="text-xs font-extrabold text-[#5E6258] uppercase tracking-wider bg-white px-3 py-1.5 rounded-lg border border-[#E2E1DD]">
              Shift Status: {isClockedIn ? 'ONLINE (ON DUTY)' : 'OFFLINE'}
            </span>
          </div>
        )}
      </div>

      {isITManagerOrAdmin ? (
        /* IT ADMIN / MANAGER VIEW */
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Open Support Tickets</span>
                <p className="text-2xl font-extrabold text-black">{openTicketsCount} Open</p>
              </div>
              <div className="bg-[#E1FF4B]/30 p-3 rounded-xl text-black border border-[#C0D930]/30 shadow-sm">
                <HelpCircle className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Critical SLA Incidents</span>
                <p className="text-2xl font-extrabold text-[#FF3E3E]">{highPriorityTickets.length} Alert</p>
              </div>
              <div className="bg-[#FF3E3E]/10 p-3 rounded-xl text-[#FF3E3E] border border-[#FF3E3E]/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Local Node Uptime</span>
                <p className="text-2xl font-extrabold text-[#3CD070]">99.98%</p>
              </div>
              <div className="bg-[#3CD070]/10 p-3 rounded-xl text-[#3CD070] border border-[#3CD070]/20">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
            </div>

            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Storage Quota</span>
                <p className="text-2xl font-extrabold text-black">42% Used</p>
              </div>
              <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E2E1DD]">
                <HardDrive className="h-5 w-5 text-black" />
              </div>
            </div>
          </div>

          {/* Splits */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column */}
            <div className="space-y-8">
              {/* Diagnostics */}
              <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-[#C0D930]" /> Diagnostics Console
                </h3>
                
                <form onSubmit={runDiagnosticPing} className="space-y-3 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[#5E6258]">Network Host Address</label>
                    <input 
                      type="text" 
                      value={pingTarget}
                      onChange={(e) => setPingTarget(e.target.value)}
                      required
                      placeholder="e.g. api.omnihub.com..."
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isPinging}
                    className="w-full py-2 bg-black hover:bg-black/90 disabled:bg-black/60 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    {isPinging ? 'Pinging...' : 'Run Latency Ping'}
                  </button>
                  {pingResult && (
                    <div className="p-3 bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl font-mono text-[9px] text-[#5E6258] leading-tight break-all">
                      {pingResult}
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Right Columns */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Audit events */}
              <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-[#E2E1DD] pb-3">
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider">System Audit Logs</h3>
                  <Link href="/admin/audit" className="text-[10px] font-extrabold text-[#8C9086] hover:text-black uppercase tracking-wider">Full Ledger</Link>
                </div>
                
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {systemAuditLogs.slice(0, 3).map(log => (
                    <div key={log.id} className="p-3 bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl font-mono text-[9px] text-[#5E6258] leading-tight">
                      <span className="text-[8px] text-[#8C9086] block mb-1">{log.timestamp}</span>
                      <p className="text-black font-semibold">"{log.action}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </>
      ) : (
        /* IT EMPLOYEE PORTAL VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Clock controller, Diagnostics, and Leave Request forms */}
          <div className="space-y-8">
            {/* Shift Logs geofenced check-in */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-3 text-black border-b border-[#E2E1DD] pb-3">
                <Clock className="h-5 w-5 text-[#C0D930] animate-pulse" />
                <h3 className="text-xs font-extrabold text-[#1A1C18] uppercase tracking-wider">Geofenced Check-in</h3>
              </div>

              {isClockedIn ? (
                <div className="space-y-4 bg-[#3CD070]/5 border border-[#3CD070]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#3CD070] animate-ping"></span>
                    <span className="text-xs font-bold text-[#3CD070] uppercase tracking-wider">Shift Active</span>
                  </div>
                  <p className="text-[9px] text-[#5E6258] font-bold uppercase">Location: Bangalore HQ Office Bay</p>

                  <form onSubmit={handleClockOut} className="space-y-3">
                    <input 
                      type="text" 
                      value={clockNotes}
                      onChange={(e) => setClockNotes(e.target.value)}
                      required
                      placeholder="Handover notes (Mandatory)..."
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#FF3E3E] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                    />
                    <button 
                      type="submit" 
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF3E3E] hover:bg-[#FF3E3E]/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      <Square className="h-3.5 w-3.5 fill-current" /> Stop Shift Log
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4 bg-[#FF3E3E]/5 border border-[#FF3E3E]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#FF3E3E]"></span>
                    <span className="text-xs font-bold text-[#FF3E3E] uppercase tracking-wider">Shift Inactive (Offline)</span>
                  </div>

                  <form onSubmit={handleClockIn} className="space-y-3">
                    <input 
                      type="text" 
                      value={clockNotes}
                      onChange={(e) => setClockNotes(e.target.value)}
                      placeholder="Shift start notes..."
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                    />
                    <button 
                      type="submit" 
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> Initialize Shift
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Diagnostic console */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#C0D930]" /> Local Node Ping
              </h3>
              
              <form onSubmit={runDiagnosticPing} className="space-y-3 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#5E6258]">Network Address</label>
                  <input 
                    type="text" 
                    value={pingTarget}
                    onChange={(e) => setPingTarget(e.target.value)}
                    required
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black focus:outline-none transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isPinging}
                  className="w-full py-2 bg-black hover:bg-black/90 disabled:bg-black/60 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {isPinging ? 'Running...' : 'Run Diagnostics'}
                </button>
                {pingResult && (
                  <div className="p-3 bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl font-mono text-[9px] text-[#5E6258] leading-tight break-all">
                    {pingResult}
                  </div>
                )}
              </form>
            </div>

            {/* Quick Leave Request form */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">Quick Leave Request</h3>
              <form onSubmit={handleQuickLeave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#5E6258]">Leave Type</label>
                  <select 
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                  >
                    <option value="sick">Sick Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="annual">Annual Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[#5E6258]">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-2 py-1.5 text-xs text-black focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[#5E6258]">End Date</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-2 py-1.5 text-xs text-black focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#5E6258]">Reason</label>
                  <input 
                    type="text" 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Reason for leave request..."
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button 
                    type="submit"
                    className="w-full py-2 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Submit Leave Request
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Raised IT Tickets, handovers, and Leave Requests history */}
          <div className="lg:col-span-2 space-y-8">
            {/* Raised Tickets */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">My Support Tickets</h3>
              <div className="space-y-3">
                {myOpenTickets.map(ticket => (
                  <div key={ticket.id} className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 flex justify-between items-center text-xs shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] font-extrabold uppercase bg-white border border-[#E2E1DD] px-1.5 py-0.5 rounded text-[#5E6258]">
                          {ticket.category}
                        </span>
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          ticket.status === 'open' ? 'bg-amber-400/10 text-amber-500 border border-amber-400/20' : 'bg-[#3CD070]/10 text-[#3CD070] border border-[#3CD070]/20'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-black">{ticket.title}</h4>
                      <p className="text-[9px] text-[#8C9086] font-semibold mt-0.5">Submitted: {ticket.created_at}</p>
                    </div>
                    <span className="font-extrabold uppercase text-[8px] bg-red-500/10 border border-red-500/20 text-red-500 px-2.5 py-1 rounded">
                      {ticket.priority} SLA
                    </span>
                  </div>
                ))}
                {myOpenTickets.length === 0 && (
                  <p className="text-xs text-[#8C9086] italic text-center py-6">No raised IT support tickets.</p>
                )}
              </div>
            </div>

            {/* Handover comments history logs */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm h-fit">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">Shift Handovers Comment History</h3>
              <div className="space-y-3">
                {myShiftsHandoverHistory.map(shift => (
                  <div key={shift.id} className="p-3 bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-[8px] font-bold text-[#8C9086] uppercase">
                      <span>Shift Log Ending</span>
                      <span>{shift.clock_out || 'Active'}</span>
                    </div>
                    <p className="text-black font-semibold italic">"{shift.notes}"</p>
                  </div>
                ))}
                {myShiftsHandoverHistory.length === 0 && (
                  <p className="text-xs text-[#8C9086] italic text-center py-6">No historical shift handover logs registered.</p>
                )}
              </div>
            </div>

            {/* Leaves History */}
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider border-b border-[#E2E1DD] pb-3">My Leave Requests</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E1DD] text-[10px] font-bold uppercase tracking-wider text-[#5E6258]">
                      <th className="py-2.5 px-4">Leave Type</th>
                      <th className="py-2.5 px-4">Dates</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E1DD]/40 text-xs text-[#5E6258]">
                    {myLeaves.map((req) => (
                      <tr key={req.id}>
                        <td className="py-3 px-4 font-bold capitalize text-black">{req.leave_type}</td>
                        <td className="py-3 px-4">{req.start_date} to {req.end_date}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            req.status === 'approved'
                              ? 'bg-[#3CD070]/10 text-[#3CD070] border border-[#3CD070]/20'
                              : req.status === 'rejected'
                              ? 'bg-[#FF3E3E]/10 text-[#FF3E3E] border-[#FF3E3E]/20'
                              : 'bg-amber-400/10 text-amber-500 border border-amber-400/20'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {myLeaves.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-6 text-center italic text-[#8C9086]">No leave requests submitted yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
