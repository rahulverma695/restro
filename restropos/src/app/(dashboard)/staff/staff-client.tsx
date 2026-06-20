"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Users, CalendarDays, ClipboardList, BarChart3, Plus, Check, X, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isWeekend } from "date-fns";

type StaffUser = { id: string; name: string; email: string; role: string };
type StaffProfile = { id: string; userId: string; designation: string | null; phone: string | null; salary: number | null; shiftType: string; joinDate: string; isActive: boolean; user: StaffUser };
type AttendanceRecord = { id: string; staffId: string; date: string; status: string; minutesLate: number; note: string | null };
type LeaveRequest = { id: string; staffId: string; fromDate: string; toDate: string; type: string; reason: string | null; status: string; staff: { user: { name: string } } };

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PRESENT:  { label: "Present",  color: "#10b981", bg: "#f0fdf4", dot: "#10b981" },
  ABSENT:   { label: "Absent",   color: "#ef4444", bg: "#fff1f2", dot: "#ef4444" },
  LATE:     { label: "Late",     color: "#f59e0b", bg: "#fffbeb", dot: "#f59e0b" },
  HALF_DAY: { label: "Half Day", color: "#3b82f6", bg: "#eff6ff", dot: "#3b82f6" },
  ON_LEAVE: { label: "On Leave", color: "#8b5cf6", bg: "#faf5ff", dot: "#8b5cf6" },
};

const LEAVE_STATUS: Record<string, any> = {
  PENDING: "warning", APPROVED: "success", REJECTED: "destructive",
};

export function StaffClient({ staff, leaves: initialLeaves }: { staff: StaffProfile[]; leaves: LeaveRequest[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "attendance" | "calendar" | "leaves" | "reports" | "directory">("overview");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState(initialLeaves);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string>(staff[0]?.id || "");
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [todayMarks, setTodayMarks] = useState<Record<string, string>>({});

  const [staffForm, setStaffForm] = useState({ name: "", email: "", password: "", role: "CASHIER", designation: "", phone: "", salary: "", shiftType: "FULL_DAY", joinDate: format(new Date(), "yyyy-MM-dd") });
  const [leaveForm, setLeaveForm] = useState({ staffId: "", fromDate: "", toDate: "", type: "CASUAL", reason: "" });

  const monthStr = format(currentMonth, "yyyy-MM");
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    fetch(`/api/staff/attendance?month=${monthStr}`)
      .then(r => r.json())
      .then(setAttendance);
  }, [monthStr]);

  // Pre-fill today's marks from existing attendance
  useEffect(() => {
    const marks: Record<string, string> = {};
    attendance.forEach(r => {
      if (format(new Date(r.date), "yyyy-MM-dd") === today) {
        marks[r.staffId] = r.status;
      }
    });
    setTodayMarks(marks);
  }, [attendance, today]);

  async function saveAttendance() {
    setLoading(true);
    const records = staff.map(s => ({
      staffId: s.id,
      date: today,
      status: todayMarks[s.id] || "ABSENT",
    }));
    await fetch("/api/staff/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records }),
    });
    setLoading(false);
    const res = await fetch(`/api/staff/attendance?month=${monthStr}`);
    setAttendance(await res.json());
    alert("Attendance saved!");
  }

  async function addStaff() {
    setLoading(true);
    await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(staffForm),
    });
    setLoading(false);
    setAddStaffOpen(false);
    router.refresh();
  }

  async function applyLeave() {
    setLoading(true);
    await fetch("/api/staff/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leaveForm),
    });
    setLoading(false);
    setLeaveOpen(false);
    const res = await fetch("/api/staff/leaves");
    setLeaves(await res.json());
  }

  async function reviewLeave(id: string, status: string) {
    await fetch(`/api/staff/leaves/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const res = await fetch("/api/staff/leaves");
    setLeaves(await res.json());
    const attRes = await fetch(`/api/staff/attendance?month=${monthStr}`);
    setAttendance(await attRes.json());
  }

  // Calendar data for selected staff
  const calendarDays = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const calendarAttendance = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {};
    attendance.filter(r => r.staffId === selectedStaff).forEach(r => {
      map[format(new Date(r.date), "yyyy-MM-dd")] = r;
    });
    return map;
  }, [attendance, selectedStaff]);

  // Monthly summary per staff
  const monthlySummary = useMemo(() => {
    return staff.map(s => {
      const recs = attendance.filter(r => r.staffId === s.id);
      const present = recs.filter(r => r.status === "PRESENT").length;
      const absent = recs.filter(r => r.status === "ABSENT").length;
      const late = recs.filter(r => r.status === "LATE").length;
      const halfDay = recs.filter(r => r.status === "HALF_DAY").length;
      const onLeave = recs.filter(r => r.status === "ON_LEAVE").length;
      const workingDays = calendarDays.filter(d => !isWeekend(d)).length;
      const pct = workingDays > 0 ? Math.round(((present + halfDay * 0.5) / workingDays) * 100) : 0;
      return { staff: s, present, absent, late, halfDay, onLeave, workingDays, pct };
    });
  }, [attendance, staff, calendarDays]);

  const pendingLeaves = leaves.filter(l => l.status === "PENDING");
  const todayPresent = Object.values(todayMarks).filter(s => s === "PRESENT").length;

  const tabs = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "attendance", label: "Mark Attendance", icon: Check },
    { key: "calendar", label: "Calendar", icon: CalendarDays },
    { key: "leaves", label: "Leaves", icon: ClipboardList },
    { key: "reports", label: "Reports", icon: BarChart3 },
    { key: "directory", label: "Staff", icon: Users },
  ] as const;

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-500" /> Staff & Attendance
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{staff.length} staff members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLeaveOpen(true)}>Apply Leave</Button>
          <Button onClick={() => setAddStaffOpen(true)}><Plus className="w-4 h-4" /> Add Staff</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 overflow-x-auto" style={{ background: "rgba(255,255,255,0.07)" }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all`}
            style={tab === key
              ? { background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.95)" }
              : { color: "rgba(255,255,255,0.5)" }}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Staff", value: staff.length, color: "#f97316" },
              { label: "Present Today", value: todayPresent, color: "#10b981" },
              { label: "Absent Today", value: staff.length - todayPresent, color: "#ef4444" },
              { label: "Pending Leaves", value: pendingLeaves.length, color: "#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-xs uppercase tracking-wide font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
                <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {pendingLeaves.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="font-semibold mb-3 text-white">Pending Leave Requests</p>
              <div className="space-y-2">
                {pendingLeaves.map(l => (
                  <div key={l.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                    <div>
                      <p className="font-semibold text-sm text-white">{l.staff.user.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{format(new Date(l.fromDate), "dd MMM")} – {format(new Date(l.toDate), "dd MMM")} · {l.type} · {l.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => reviewLeave(l.id, "APPROVED")} className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600"><Check className="w-4 h-4" /></button>
                      <button onClick={() => reviewLeave(l.id, "REJECTED")} className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Mark Attendance ── */}
      {tab === "attendance" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <p className="font-bold text-white">Mark Attendance</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{format(new Date(), "EEEE, dd MMMM yyyy")}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setTodayMarks(Object.fromEntries(staff.map(s => [s.id, "PRESENT"])))}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                style={{ background: "rgba(16,185,129,0.15)", color: "#4ade80", border: "1px solid rgba(16,185,129,0.3)" }}>
                Mark All Present
              </button>
              <Button onClick={saveAttendance} disabled={loading} size="sm">
                {loading ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </div>
          <div>
            {staff.map(s => (
              <div key={s.id} className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {s.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{s.user.name}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{s.designation || s.user.role} · {s.shiftType.replace("_", " ")}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                    <button key={status} onClick={() => setTodayMarks(prev => ({ ...prev, [s.id]: status }))}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                      style={todayMarks[s.id] === status
                        ? { background: cfg.dot, borderColor: "transparent", color: "#fff" }
                        : { borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {staff.length === 0 && <p className="text-center py-12" style={{ color: "rgba(255,255,255,0.4)" }}>No staff added yet</p>}
          </div>
        </div>
      )}

      {/* ── Calendar ── */}
      {tab === "calendar" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <select className="rounded-xl px-3 py-2 text-sm"
              style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}
              value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
              {staff.map(s => <option key={s.id} value={s.id}>{s.user.name}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold min-w-[120px] text-center text-white">{format(currentMonth, "MMMM yyyy")}</span>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: "rgba(255,255,255,0.4)" }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => <div key={`e${i}`} />)}
              {calendarDays.map(day => {
                const key = format(day, "yyyy-MM-dd");
                const rec = calendarAttendance[key];
                const cfg = rec ? STATUS_CONFIG[rec.status] : null;
                const isToday = isSameDay(day, new Date());
                return (
                  <div key={key} className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition-all ${isWeekend(day) ? "opacity-40" : ""}`}
                    style={{
                      background: cfg ? cfg.bg : isToday ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.04)",
                      border: isToday ? "2px solid #f97316" : "1px solid rgba(255,255,255,0.06)",
                    }}>
                    <span style={{ color: "rgba(255,255,255,0.8)" }}>{format(day, "d")}</span>
                    {cfg && <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: cfg.dot }} />}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {Object.entries(STATUS_CONFIG).map(([, cfg]) => (
                <div key={cfg.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.dot }} />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Leaves ── */}
      {tab === "leaves" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="font-bold text-white">Leave Requests</p>
          </div>
          <div>
            {leaves.map(l => (
              <div key={l.id} className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <p className="font-semibold text-sm text-white">{l.staff.user.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {format(new Date(l.fromDate), "dd MMM")} – {format(new Date(l.toDate), "dd MMM yyyy")} · {l.type} Leave
                    {l.reason && ` · "${l.reason}"`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={LEAVE_STATUS[l.status]}>{l.status}</Badge>
                  {l.status === "PENDING" && (
                    <>
                      <button onClick={() => reviewLeave(l.id, "APPROVED")} className="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600"><Check className="w-3 h-3" /></button>
                      <button onClick={() => reviewLeave(l.id, "REJECTED")} className="w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600"><X className="w-3 h-3" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {leaves.length === 0 && <p className="text-center py-12" style={{ color: "rgba(255,255,255,0.4)" }}>No leave requests</p>}
          </div>
        </div>
      )}

      {/* ── Reports ── */}
      {tab === "reports" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-white">{format(currentMonth, "MMMM yyyy")}</span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <table className="w-full text-sm">
              <thead style={{ background: "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <tr>
                  {["Staff", "Present", "Absent", "Late", "Half Day", "On Leave", "Working Days", "Attendance %"].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map(({ staff: s, present, absent, late, halfDay, onLeave, workingDays, pct }) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{s.user.name}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{s.designation || s.user.role}</p>
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">{present}</td>
                    <td className="px-4 py-3 text-red-400 font-semibold">{absent}</td>
                    <td className="px-4 py-3 text-amber-400 font-semibold">{late}</td>
                    <td className="px-4 py-3 text-blue-400 font-semibold">{halfDay}</td>
                    <td className="px-4 py-3 text-purple-400 font-semibold">{onLeave}</td>
                    <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.5)" }}>{workingDays}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-full h-1.5 max-w-[60px]" style={{ background: "rgba(255,255,255,0.1)" }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444" }} />
                        </div>
                        <span className="font-bold text-white">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {monthlySummary.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12" style={{ color: "rgba(255,255,255,0.4)" }}>No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Directory ── */}
      {tab === "directory" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <table className="w-full text-sm">
            <thead style={{ background: "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <tr>
                {["Name", "Role", "Designation", "Phone", "Shift", "Salary", "Joined"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-xs">{s.user.name[0].toUpperCase()}</div>
                      <div>
                        <p className="font-semibold text-white">{s.user.name}</p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{s.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="secondary">{s.user.role}</Badge></td>
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.7)" }}>{s.designation || "—"}</td>
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.7)" }}>{s.phone || "—"}</td>
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.7)" }}>{s.shiftType.replace("_", " ")}</td>
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.7)" }}>{s.salary ? `₹${s.salary.toLocaleString("en-IN")}` : "—"}</td>
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.5)" }}>{format(new Date(s.joinDate), "dd MMM yyyy")}</td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12" style={{ color: "rgba(255,255,255,0.4)" }}>No staff added yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="col-span-2"><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.6)" }}>Name *</label><Input className="mt-1" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} placeholder="Rahul Kumar" /></div>
            <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.6)" }}>Email *</label><Input className="mt-1" type="email" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} placeholder="rahul@email.com" /></div>
            <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.6)" }}>Password *</label><Input className="mt-1" type="password" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} placeholder="Min 8 chars" /></div>
            <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.6)" }}>Role</label>
              <select className="w-full mt-1 rounded-xl px-3 py-2 text-sm"
                style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}
                value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})}>
                {["CASHIER","CAPTAIN","MANAGER"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.6)" }}>Designation</label><Input className="mt-1" value={staffForm.designation} onChange={e => setStaffForm({...staffForm, designation: e.target.value})} placeholder="Head Chef" /></div>
            <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.6)" }}>Phone</label><Input className="mt-1" value={staffForm.phone} onChange={e => setStaffForm({...staffForm, phone: e.target.value})} placeholder="+91 98765 43210" /></div>
            <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.6)" }}>Monthly Salary (₹)</label><Input className="mt-1" type="number" value={staffForm.salary} onChange={e => setStaffForm({...staffForm, salary: e.target.value})} placeholder="15000" /></div>
            <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.6)" }}>Shift</label>
              <select className="w-full mt-1 rounded-xl px-3 py-2 text-sm"
                style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}
                value={staffForm.shiftType} onChange={e => setStaffForm({...staffForm, shiftType: e.target.value})}>
                {["FULL_DAY","MORNING","EVENING"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.6)" }}>Join Date</label><Input className="mt-1" type="date" value={staffForm.joinDate} onChange={e => setStaffForm({...staffForm, joinDate: e.target.value})} /></div>
            <div className="col-span-2"><Button onClick={addStaff} disabled={loading || !staffForm.name || !staffForm.email || !staffForm.password} className="w-full">{loading ? "Adding..." : "Add Staff Member"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply for Leave</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.6)" }}>Staff Member</label>
              <select className="w-full mt-1 rounded-xl px-3 py-2 text-sm"
                style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}
                value={leaveForm.staffId} onChange={e => setLeaveForm({...leaveForm, staffId: e.target.value})}>
                <option value="">Select staff</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.user.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.6)" }}>From</label><Input className="mt-1" type="date" value={leaveForm.fromDate} onChange={e => setLeaveForm({...leaveForm, fromDate: e.target.value})} /></div>
              <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.6)" }}>To</label><Input className="mt-1" type="date" value={leaveForm.toDate} onChange={e => setLeaveForm({...leaveForm, toDate: e.target.value})} /></div>
            </div>
            <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.6)" }}>Leave Type</label>
              <select className="w-full mt-1 rounded-xl px-3 py-2 text-sm"
                style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}
                value={leaveForm.type} onChange={e => setLeaveForm({...leaveForm, type: e.target.value})}>
                {["CASUAL","SICK","UNPAID"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.6)" }}>Reason</label><Input className="mt-1" value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} placeholder="Optional" /></div>
            <Button onClick={applyLeave} disabled={loading || !leaveForm.staffId || !leaveForm.fromDate || !leaveForm.toDate} className="w-full">{loading ? "Submitting..." : "Submit Leave Request"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
