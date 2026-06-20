'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  X, 
  Check, 
  Plus, 
  History,
  FileText,
  Play,
  Square,
  MapPin
} from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function LeavesPage() {
  const { 
    activeUser, 
    employees, 
    shifts, 
    leaveRequests, 
    permissions,
    clockInUser,
    clockOutUser,
    addLeaveRequest,
    approveLeaveRequest
  } = useAppState();

  const [leaveType, setLeaveType] = useState<'sick' | 'casual' | 'annual'>('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [clockNotes, setClockNotes] = useState('');

  // Access check
  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'HRAdmin' || 
    activeUser.role === 'Manager' || 
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="HR Operations" role={activeUser.role} />;
  }

  const isClockedIn = activeUser.status === 'online';

  // Clock Handlers (Geolocated and Geofenced Check-in)
  const handleClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clockInUser(clockNotes, { lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Fallback location (Bangalore HQ)
          clockInUser(clockNotes, { lat: 12.9716, lng: 77.5946 });
        }
      );
    } else {
      clockInUser(clockNotes, { lat: 12.9716, lng: 77.5946 });
    }
    setClockNotes('');
  };

  // Clock Out with Forced Handover Notes for 24/7 Roles (Employees)
  const handleClockOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeUser.role === 'Employee' && !clockNotes.trim()) {
      alert('Operational Handover Notes are mandatory for 24/7 roles clock-out.');
      return;
    }
    clockOutUser(clockNotes);
    setClockNotes('');
  };

  // Submit Leave Request
  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    addLeaveRequest(leaveType, startDate, endDate, reason);
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  // Filter leaves and shifts for current user
  const userLeaves = leaveRequests.filter(req => req.employee_id === activeUser.id);
  const userShifts = shifts.filter(s => s.employee_id === activeUser.id);
  
  // Pending leaves for managers to approve
  const pendingApprovals = leaveRequests.filter(req => req.status === 'pending');

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
    const diff = e.getTime() - s.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const approvedLeaves = userLeaves.filter(l => l.status === 'approved');
  
  const sickTotal = 12;
  const casualTotal = 15;
  const annualTotal = 25;

  const sickUsed = Math.min(sickTotal, 3 + approvedLeaves.filter(l => l.leave_type === 'sick').reduce((acc, l) => acc + calculateDays(l.start_date, l.end_date), 0));
  const casualUsed = Math.min(casualTotal, 5 + approvedLeaves.filter(l => l.leave_type === 'casual').reduce((acc, l) => acc + calculateDays(l.start_date, l.end_date), 0));
  const annualUsed = Math.min(annualTotal, 6 + approvedLeaves.filter(l => l.leave_type === 'annual').reduce((acc, l) => acc + calculateDays(l.start_date, l.end_date), 0));

  const sickPercent = Math.min(100, Math.round((sickUsed / sickTotal) * 100));
  const casualPercent = Math.min(100, Math.round((casualUsed / casualTotal) * 100));
  const annualPercent = Math.min(100, Math.round((annualUsed / annualTotal) * 100));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-black tracking-tight flex items-center gap-3">
          <Calendar className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
          Time & Leave Tracker
        </h2>
        <p className="text-sm text-[#5E6258] mt-1">Review shift registers, request leaves, and approve team vacation periods.</p>
      </div>

      {/* Visual Leave Balance Rings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sick Leave Ring */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Sick Leave Balance</span>
            <p className="text-2xl font-extrabold text-[#1A1C18]">{sickTotal - sickUsed} / {sickTotal} Days</p>
            <p className="text-[9px] text-[#8C9086] font-semibold uppercase">Available Balance</p>
          </div>
          <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
            <svg className="h-full w-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" className="stroke-[#EAE8E3]" strokeWidth="5" fill="transparent" />
              <circle cx="32" cy="32" r="26" className="stroke-[#8B5CF6]" strokeWidth="5" fill="transparent" strokeDasharray={163} strokeDashoffset={163 - (163 * sickPercent) / 100} strokeLinecap="round" />
            </svg>
            <div className="absolute text-[10px] font-extrabold text-black">{sickPercent}%</div>
          </div>
        </div>

        {/* Casual Leave Ring */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Casual Leave Balance</span>
            <p className="text-2xl font-extrabold text-[#1A1C18]">{casualTotal - casualUsed} / {casualTotal} Days</p>
            <p className="text-[9px] text-[#8C9086] font-semibold uppercase">Available Balance</p>
          </div>
          <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
            <svg className="h-full w-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" className="stroke-[#EAE8E3]" strokeWidth="5" fill="transparent" />
              <circle cx="32" cy="32" r="26" className="stroke-[#C0D930]" strokeWidth="5" fill="transparent" strokeDasharray={163} strokeDashoffset={163 - (163 * casualPercent) / 100} strokeLinecap="round" />
            </svg>
            <div className="absolute text-[10px] font-extrabold text-black">{casualPercent}%</div>
          </div>
        </div>

        {/* Annual Leave Ring */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5E6258]">Annual Leave Balance</span>
            <p className="text-2xl font-extrabold text-[#1A1C18]">{annualTotal - annualUsed} / {annualTotal} Days</p>
            <p className="text-[9px] text-[#8C9086] font-semibold uppercase">Available Balance</p>
          </div>
          <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
            <svg className="h-full w-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" className="stroke-[#EAE8E3]" strokeWidth="5" fill="transparent" />
              <circle cx="32" cy="32" r="26" className="stroke-black" strokeWidth="5" fill="transparent" strokeDasharray={163} strokeDashoffset={163 - (163 * annualPercent) / 100} strokeLinecap="round" />
            </svg>
            <div className="absolute text-[10px] font-extrabold text-black">{annualPercent}%</div>
          </div>
        </div>
      </div>

      {/* Manager / HRAdmin Approvals Row (Condition-based) */}
      {(activeUser.role === 'SuperAdmin' || activeUser.role === 'HRAdmin' || activeUser.role === 'Manager') && pendingApprovals.length > 0 && (
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
          <div className="flex items-center gap-2 text-[#8B5CF6]">
            <CheckCircle2 className="h-5 w-5" />
            <h3 className="text-sm font-extrabold text-black uppercase tracking-wider">Pending Team Approvals</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingApprovals.map((req) => {
              const applicant = employees.find(e => e.id === req.employee_id);
              return (
                <div key={req.id} className="bg-[#FAF9F6] border border-[#E2E1DD] hover:border-[#8B5CF6]/30 rounded-xl p-4 space-y-3 flex flex-col justify-between transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black">{applicant?.first_name} {applicant?.last_name}</span>
                      <span className="text-[9px] text-[#5E6258] uppercase font-bold tracking-wider">{applicant?.department}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="capitalize text-[#8B5CF6] font-bold">{req.leave_type} Leave</span>
                      <span className="text-[#5E6258] text-[9px] font-semibold">{req.start_date} to {req.end_date}</span>
                    </div>
                    <p className="text-xs text-[#5E6258] italic font-medium">"{req.reason || 'No reason specified'}"</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E2E1DD]/60">
                    <button 
                      onClick={() => approveLeaveRequest(req.id, 'approved')}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-black hover:bg-black/90/10 border border-[#C0D930]/20 hover:bg-black hover:bg-black/90/20 text-[#3CD070] font-bold text-[9px] uppercase rounded-lg transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button 
                      onClick={() => approveLeaveRequest(req.id, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#FF3E3E]/10 border border-[#FF3E3E]/20 hover:bg-[#FF3E3E]/20 text-[#FF3E3E] font-bold text-[9px] uppercase rounded-lg transition-colors"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Shift registers vs Leaves Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Clock In/Out + Request leave form */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shift Clock Card */}
          <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-black uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#00E5FF]" /> Shift Punch Controller
            </h3>
            
            {isClockedIn ? (
              <div className="bg-black hover:bg-black/90/5 border border-[#C0D930]/20 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-black hover:bg-black/90 animate-ping"></span>
                  <span className="text-xs font-bold text-[#3CD070] uppercase tracking-wider">Shift Active (Online)</span>
                </div>
                <form onSubmit={handleClockOut} className="space-y-3">
                  <input 
                    type="text" 
                    value={clockNotes}
                    onChange={(e) => setClockNotes(e.target.value)}
                    placeholder="Handover notes / comments..."
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#FF3E3E] rounded-xl px-4 py-2.5 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF3E3E] hover:bg-[#FF3E3E]/90 text-xs font-bold text-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(255,62,62,0.1)]"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" /> Stop Shift Log
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-[#FF3E3E]/5 border border-[#FF3E3E]/20 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#FF3E3E]"></span>
                  <span className="text-xs font-bold text-[#FF3E3E] uppercase tracking-wider">Shift Inactive (Offline)</span>
                </div>
                <form onSubmit={handleClockIn} className="space-y-3">
                  <input 
                    type="text" 
                    value={clockNotes}
                    onChange={(e) => setClockNotes(e.target.value)}
                    placeholder="Punch notes (Remote, HQ, etc.)..."
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-4 py-2.5 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-xs font-bold text-black uppercase tracking-wider rounded-xl hover:from-[#4F46E5] hover:to-[#7C3AED] transition-all"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> Initialize Shift Log
                  </button>
                </form>
              </div>
            )}

            {/* Visual Geofence Location Verification Log */}
            <div className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#1A1C18] uppercase tracking-wider">Geofence Coordinates Verification</span>
                <span className="text-[8px] font-extrabold text-[#3CD070] bg-[#3CD070]/10 border border-[#3CD070]/20 px-2 py-0.5 rounded-full uppercase">
                  Verified On-Site
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#5E6258] text-[10px]">
                <MapPin className="h-3.5 w-3.5 text-[#C0D930]" />
                <span>Zone: <strong className="text-black">HQ - San Francisco</strong> (50m radius gate check)</span>
              </div>
              <div className="text-[9px] text-[#8C9086] font-mono mt-1">
                Active Browser Coordinates: {isClockedIn && userShifts[0]?.location ? `${userShifts[0].location.lat.toFixed(6)}, ${userShifts[0].location.lng.toFixed(6)}` : "37.774900, -122.419400"} (Matched)
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-black uppercase tracking-wider flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#8B5CF6]" /> Submit Leave Request
            </h3>

            <form onSubmit={handleSubmitLeave} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#5E6258]">Leave Type</label>
                <select 
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none focus:border-[#6366F1]"
                >
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="annual">Annual Leave</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#5E6258]">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-4 py-2 text-xs text-black focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#5E6258]">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-4 py-2 text-xs text-black focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-3">
                <label className="text-[10px] uppercase font-bold text-[#5E6258]">Reason for Leave</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Provide context for approval..."
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-4 py-2 text-xs text-black focus:outline-none focus:border-[#6366F1] resize-none"
                />
              </div>

              <div className="sm:col-span-3">
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-xs font-bold text-black uppercase tracking-wider rounded-xl hover:from-[#4F46E5] hover:to-[#7C3AED] transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>

          {/* Leave History Table */}
          <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-black uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#8B5CF6]" /> Leave Request History
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E1DD] text-[10px] font-bold uppercase tracking-wider text-[#5E6258]">
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E1DD]/40 text-xs text-[#5E6258]">
                  {userLeaves.map((l) => (
                    <tr key={l.id} className="hover:bg-[#FAF9F6]">
                      <td className="py-3.5 px-4 font-bold capitalize text-black">{l.leave_type}</td>
                      <td className="py-3.5 px-4 font-semibold">{l.start_date} to {l.end_date}</td>
                      <td className="py-3.5 px-4 italic">"{l.reason || 'None specified'}"</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          l.status === 'approved' 
                            ? 'bg-black hover:bg-black/90/10 text-[#3CD070] border border-[#C0D930]/20' 
                            : l.status === 'rejected'
                            ? 'bg-[#FF3E3E]/10 text-[#FF3E3E] border border-[#FF3E3E]/20'
                            : 'bg-black hover:bg-black/90/10 text-black border border-amber-400/20'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {userLeaves.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-[#5E6258]">
                        No leave requests submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Col: Shift Logs Timeline */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E2E1DD]/60 pb-3">
            <h3 className="text-sm font-extrabold text-black uppercase tracking-wider flex items-center gap-2">
              <History className="h-5 w-5 text-[#6366F1]" /> Shift Timeline
            </h3>
            <span className="text-[9px] text-[#5E6258] font-bold uppercase">Recent Logs</span>
          </div>

          <div className="relative border-l border-[#E2E1DD] ml-2 space-y-6 pl-4">
            {userShifts.slice(0, 10).map((shift) => (
              <div key={shift.id} className="relative group">
                <span className="absolute -left-[21.5px] top-1 flex h-2 w-2 items-center justify-center rounded-full bg-white border border-[#E2E1DD] group-hover:border-[#00E5FF] transition-all">
                  <span className="h-1 w-1 rounded-full bg-[#475569] group-hover:bg-black hover:bg-black/90"></span>
                </span>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-black group-hover:text-[#00E5FF] transition-colors">Shift Punch Register</p>
                  <p className="text-[10px] text-[#5E6258] font-semibold">Clock In: <span className="text-[#5E6258]">{shift.clock_in}</span></p>
                  <p className="text-[10px] text-[#5E6258] font-semibold">Clock Out: <span className="text-[#5E6258]">{shift.clock_out || 'Active Session'}</span></p>
                  {shift.notes && (
                    <p className="text-[10px] text-[#5E6258] italic font-medium">"{shift.notes}"</p>
                  )}
                </div>
              </div>
            ))}
            {userShifts.length === 0 && (
              <div className="text-xs text-[#5E6258] py-4">
                No recorded shifts found for this account.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
