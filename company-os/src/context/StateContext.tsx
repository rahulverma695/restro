'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, SuiteName, hasSuiteAccess, getActionPermissions, PermissionDetails, suitePermissions } from '@/lib/rbac';

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'online' | 'offline' | 'on_leave';
  avatar_url?: string;
  assets: string[];
  reporting_manager?: string;
  customFields?: Record<string, string>;
}

export interface HardwareAsset {
  id: string;
  name: string;
  serial_number: string;
  status: 'assigned' | 'available' | 'maintenance';
}

export interface Ticket {
  id: string;
  creator_id: string;
  assigned_id: string | null;
  category: 'IT' | 'HR' | 'Finance' | 'Facility';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export interface Shift {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
  notes?: string;
  location?: { lat: number; lng: number };
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: 'sick' | 'casual' | 'annual';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  created_at: string;
}

export interface WikiDoc {
  id: string;
  title: string;
  content: string;
  created_by: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  acknowledged_by?: string[];
}

export interface ReceiptClaim {
  id: string;
  employee_id: string;
  item: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  image_url?: string;
}

export interface SaaSVendor {
  id: string;
  name: string;
  cost: number;
  renewal_date: string;
  owner_id: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  stage: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id: string;
  time_spent: number; // in seconds
  timer_active: boolean;
}

export interface CompanyOKR {
  id: string;
  title: string;
  target: number;
  current: number;
  type: 'company' | 'department';
  dept_name?: string;
}

export interface ReviewScore {
  employee_id: string;
  self: number;
  peer: number;
  manager: number;
  dimension: string; // "Coding" | "Delivery" | "Comms" | "Teamwork"
}

export interface CoachingLog {
  id: string;
  employee_id: string;
  date: string;
  notes: string;
}

export interface RoomBooking {
  id: string;
  room_name: string;
  start_time: string;
  end_time: string;
  booker_id: string;
  date: string;
}

export interface DeskBooking {
  id: string;
  desk_id: string;
  booker_id: string;
  date: string;
}

export interface OnboardingHire {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'Hired' | 'Pipeline';
  checklist: {
    it_laptop: boolean;
    hr_payroll: boolean;
    wiki_sop: boolean;
  };
}

export interface VaultCredential {
  id: string;
  name: string;
  url: string;
  username: string;
  password_masked: string;
  password_plain: string;
  department: string;
}

export interface CustomFieldSchema {
  id: string;
  name: string;
  type: 'text' | 'dropdown';
  options?: string[];
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actor_id: string;
  action: string;
}

interface StateContextType {
  activeUser: Employee;
  activeSuite: SuiteName;
  employees: Employee[];
  tickets: Ticket[];
  comments: TicketComment[];
  shifts: Shift[];
  leaveRequests: LeaveRequest[];
  wikiDocs: WikiDoc[];
  announcements: Announcement[];
  permissions: PermissionDetails;
  
  // Expanded States
  receiptClaims: ReceiptClaim[];
  saasVendors: SaaSVendor[];
  projectTasks: ProjectTask[];
  okrs: CompanyOKR[];
  reviewScores: ReviewScore[];
  coachingLogs: CoachingLog[];
  roomBookings: RoomBooking[];
  deskBookings: DeskBooking[];
  onboardingHires: OnboardingHire[];
  vaultCredentials: VaultCredential[];
  customFieldsSchema: CustomFieldSchema[];
  systemAuditLogs: SystemAuditLog[];

  // Actions
  switchActiveUser: (id: string) => void;
  switchSuite: (suite: SuiteName) => void;
  clockInUser: (notes?: string, location?: { lat: number; lng: number }) => void;
  clockOutUser: (notes?: string) => void;
  addTicket: (category: any, title: string, description: string, priority: any) => void;
  addTicketComment: (ticketId: string, message: string) => void;
  changeTicketStatus: (ticketId: string, status: any) => void;
  changeTicketAssignment: (ticketId: string, assignedId: string | null) => void;
  approveLeaveRequest: (requestId: string, status: 'approved' | 'rejected') => void;
  addLeaveRequest: (leaveType: 'sick' | 'casual' | 'annual', startDate: string, endDate: string, reason: string) => void;
  saveWikiDoc: (title: string, content: string, docId?: string) => void;
  deleteWikiDoc: (docId: string) => void;
  postAnnouncement: (title: string, content: string) => void;
  acknowledgeAnnouncement: (annId: string) => void;

  // New Actions
  addReceiptClaim: (item: string, amount: number, category: string, imageUrl?: string) => void;
  approveReceiptClaim: (claimId: string, status: 'approved' | 'rejected') => void;
  addProjectTask: (title: string, priority: 'low' | 'medium' | 'high', assigneeId: string) => void;
  toggleTaskTimer: (taskId: string) => void;
  changeTaskStage: (taskId: string, stage: 'todo' | 'inprogress' | 'done') => void;
  addRoomBooking: (roomName: string, date: string, startTime: string, endTime: string) => void;
  addDeskBooking: (deskId: string, date: string) => void;
  hireOnboardCandidate: (candidateId: string) => void;
  updateOnboardingChecklist: (candidateId: string, item: 'it_laptop' | 'hr_payroll' | 'wiki_sop', value: boolean) => void;
  addCustomFieldSchema: (name: string, type: 'text' | 'dropdown', options?: string[]) => void;
  updateEmployeeCustomFieldValue: (empId: string, fieldName: string, value: string) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

// Initial Seed Data
const initialEmployees: Employee[] = [
  {
    id: 'e1',
    first_name: 'Nikhil',
    last_name: 'Bhaviyavar',
    email: 'nikhil@omnihub.com',
    role: 'HRAdmin',
    department: 'HR Operations',
    status: 'online',
    assets: ['ThinkPad X1 Carbon', 'Logitech MX Master 3S Mouse'],
    reporting_manager: 'Alex Johnson',
    customFields: { 'Slack Handle': '@nikhil.hr', 'Work Location': 'HQ - Bangalore' }
  },
  {
    id: 'e2',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@omnihub.com',
    role: 'Employee',
    department: 'Engineering',
    status: 'offline',
    assets: ['MacBook Pro 16"', 'Dell UltraSharp 27" 4K Monitor', 'Keychron K3 Keyboard'],
    reporting_manager: 'Jane Smith',
    customFields: { 'Slack Handle': '@johndoe.dev', 'Work Location': 'Remote - USA' }
  },
  {
    id: 'e3',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@omnihub.com',
    role: 'Manager',
    department: 'Finance',
    status: 'online',
    assets: ['iPad Pro 12.9"', 'Apple Pencil 2', 'Dell USB-C Hub'],
    reporting_manager: 'Alex Johnson',
    customFields: { 'Slack Handle': '@jane.fin', 'Work Location': 'HQ - SF' }
  },
  {
    id: 'e4',
    first_name: 'Alex',
    last_name: 'Johnson',
    email: 'alex@omnihub.com',
    role: 'SuperAdmin',
    department: 'IT Operations',
    status: 'online',
    assets: ['Framework Laptop 16', 'ASUS ProArt Screen', 'YubiKey 5C NFC'],
    reporting_manager: 'None (CEO)',
    customFields: { 'Slack Handle': '@alex.admin', 'Work Location': 'HQ - Bangalore' }
  },
];

const initialTickets: Ticket[] = [
  {
    id: 't1',
    creator_id: 'e2',
    assigned_id: 'e4',
    category: 'IT',
    title: 'Request for Dual Monitor Setup',
    description: 'Hi support team, I would benefit from a secondary screen to review Figma mockups side-by-side with code files. Requesting a standard 27-inch 4K screen. Thanks!',
    priority: 'medium',
    status: 'open',
    created_at: '2026-06-14, 10:00:00 AM',
  },
  {
    id: 't2',
    creator_id: 'e3',
    assigned_id: 'e1',
    category: 'HR',
    title: 'Reimbursement Form Query',
    description: 'Could someone please share the link to download the travel expense reimbursement Excel template? The current wiki link seems to redirect to a missing file.',
    priority: 'low',
    status: 'in_progress',
    created_at: '2026-06-15, 05:00:00 AM',
  },
];

const initialComments: TicketComment[] = [
  {
    id: 'c1',
    ticket_id: 't1',
    sender_id: 'e4',
    message: 'Hey John, I have checked inventory. We have a couple of Dell U2723QE screens available in storage. I will assign one to you and arrange delivery for tomorrow.',
    created_at: '2026-06-14, 02:00:00 PM',
  },
  {
    id: 'c2',
    ticket_id: 't1',
    sender_id: 'e2',
    message: 'Awesome! Thanks for the quick update, Alex.',
    created_at: '2026-06-14, 04:00:00 PM',
  },
];

const initialWikiDocs: WikiDoc[] = [
  {
    id: 'w1',
    title: 'Employee Onboarding & Handbook',
    content: `Welcome to OmniHub! This guide contains everything you need to set up on your first day.
    
    1. OFFICE ACCESS & BADGES
    Collect your ID badge from the front facility desk on the 3rd floor. Ensure you log your badge ID with HR.
    
    2. LOCAL DEVELOPMENT ENVIRONMENT
    For Engineering staff, check out the Setup Guide for details on installing CLI dependencies, node credentials, and Docker containers.
    
    3. TIMESHEET COMPLIANCE
    Always clock in on the dashboard when starting your shift, as this updates the company presence ledger.`,
    created_by: 'e1',
    updated_at: '2026-06-13',
  },
  {
    id: 'w2',
    title: 'Next.js Development Standards',
    content: `Coding guidelines for Next.js App Router applications:
    
    - Structure: Keep UI components modular inside @/components, and route pages inside @/app.
    - SQL: Execute Postgres queries using the Singleton Connection pattern found in @/lib/db.ts to avoid pool leaks.
    - Styling: Write clean, inline Tailwind CSS utilities. Avoid custom raw CSS where possible to maintain aesthetic cohesion.`,
    created_by: 'e4',
    updated_at: '2026-06-14',
  },
];

const initialAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'Company Offsite Scheduled!',
    content: 'We are excited to announce our annual company offsite next month. Details about locations, flight bookings, and schedules will be shared directly by email shortly.',
    created_by: 'e1',
    created_at: '2026-06-12',
    acknowledged_by: []
  },
  {
    id: 'a2',
    title: 'Security Policy Update',
    content: 'All developer machines must enable disk encryption and use secure hardware keys (like Yubikeys) for SSH access. Reach out to IT Support if you do not have a hardware key.',
    created_by: 'e4',
    created_at: '2026-06-15',
    acknowledged_by: []
  },
];

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 'l1',
    employee_id: 'e2',
    leave_type: 'annual',
    start_date: '2026-07-01',
    end_date: '2026-07-05',
    reason: 'Annual family summer vacation',
    status: 'pending',
    approved_by: null,
    created_at: '2026-06-14, 10:00:00 AM',
  },
];

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [activeUser, setActiveUser] = useState<Employee>(initialEmployees[3]); // Default Alex (SuperAdmin)
  const [activeSuite, setActiveSuite] = useState<SuiteName>('hr');
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [comments, setComments] = useState<TicketComment[]>(initialComments);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [wikiDocs, setWikiDocs] = useState<WikiDoc[]>(initialWikiDocs);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  const [permissions, setPermissions] = useState<PermissionDetails>(getActionPermissions(activeUser.role));

  // Sync permissions when activeUser role changes
  useEffect(() => {
    setPermissions(getActionPermissions(activeUser.role));
  }, [activeUser.role]);

  // Dynamic state hooks for expanded features
  const [receiptClaims, setReceiptClaims] = useState<ReceiptClaim[]>([
    { id: 'r1', employee_id: 'e2', item: 'Remote Office Desk Setup', amount: 350, category: 'Hardware', date: '2026-06-14', status: 'pending' },
    { id: 'r2', employee_id: 'e3', item: 'Figma Pro Team License', amount: 180, category: 'Software SaaS', date: '2026-06-13', status: 'approved' }
  ]);

  const [saasVendors, setSaasVendors] = useState<SaaSVendor[]>([
    { id: 'v_saas1', name: 'Vercel Enterprise', cost: 3200, renewal_date: '2026-07-15', owner_id: 'e4' },
    { id: 'v_saas2', name: 'Neon Serverless DB', cost: 1200, renewal_date: '2026-07-01', owner_id: 'e4' },
    { id: 'v_saas3', name: 'Figma Pro Sub', cost: 180, renewal_date: '2026-06-30', owner_id: 'e3' }
  ]);

  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([
    { id: 't_p1', title: 'Implement dynamic 10-suite navigation layout', stage: 'done', priority: 'high', assignee_id: 'e2', time_spent: 3600, timer_active: false },
    { id: 't_p2', title: 'Integrate geofenced geolocated shifts logs', stage: 'inprogress', priority: 'medium', assignee_id: 'e2', time_spent: 180, timer_active: false },
    { id: 't_p3', title: 'Scaffold Desk Hoteling interactive floor maps', stage: 'todo', priority: 'low', assignee_id: 'e2', time_spent: 0, timer_active: false }
  ]);

  const [okrs, setOkrs] = useState<CompanyOKR[]>([
    { id: 'o1', title: 'Maintain System Node Uptime above 99.9% ', target: 99.9, current: 99.98, type: 'company' },
    { id: 'o2', title: 'Keep IT tickets resolution response SLA < 2 hours', target: 2.0, current: 2.4, type: 'company' },
    { id: 'o3', title: 'Complete onboarding checklists for hires', target: 100, current: 80, type: 'department', dept_name: 'HR Operations' }
  ]);

  const [reviewScores, setReviewScores] = useState<ReviewScore[]>([
    { employee_id: 'e2', self: 4.0, peer: 4.5, manager: 4.2, dimension: 'Coding' },
    { employee_id: 'e2', self: 4.5, peer: 4.0, manager: 4.5, dimension: 'Delivery' },
    { employee_id: 'e2', self: 3.5, peer: 4.2, manager: 4.0, dimension: 'Comms' },
    { employee_id: 'e2', self: 4.0, peer: 4.5, manager: 4.3, dimension: 'Teamwork' }
  ]);

  const [coachingLogs, setCoachingLogs] = useState<CoachingLog[]>([
    { id: 'cl1', employee_id: 'e2', date: '2026-06-12', notes: 'Discussed task progress. John is doing fantastic with Next.js Turbopack migration. Encouraged him to start on the Vault setup.' }
  ]);

  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([
    { id: 'rb1', room_name: 'Conference Room Alpha', date: '2026-06-15', start_time: '10:00 AM', end_time: '11:00 AM', booker_id: 'e1' },
    { id: 'rb2', room_name: 'Boardroom', date: '2026-06-15', start_time: '02:00 PM', end_time: '03:00 PM', booker_id: 'e3' }
  ]);

  const [deskBookings, setDeskBookings] = useState<DeskBooking[]>([
    { id: 'db1', desk_id: 'Desk-03', booker_id: 'e2', date: '2026-06-15' }
  ]);

  const [onboardingHires, setOnboardingHires] = useState<OnboardingHire[]>([
    { id: 'h1', name: 'Sophia Miller', role: 'Staff Frontend Engineer', email: 'sophia.m@gmail.com', status: 'Hired', checklist: { it_laptop: true, hr_payroll: true, wiki_sop: false } },
    { id: 'h2', name: 'Liam Davies', role: 'Senior DevOps Architect', email: 'liam.d@gmail.com', status: 'Pipeline', checklist: { it_laptop: false, hr_payroll: false, wiki_sop: false } }
  ]);

  const [vaultCredentials, setVaultCredentials] = useState<VaultCredential[]>([
    { id: 'vc1', name: 'ACME Corporate AWS Master Root Account', url: 'aws.amazon.com', username: 'root@acme.com', password_masked: '••••••••••••••••', password_plain: 'AWS#Root#Secure#2026!', department: 'IT Operations' },
    { id: 'vc2', name: 'OmniHub Figma Team Billing Login', url: 'figma.com', username: 'billing@omnihub.com', password_masked: '••••••••••••••••', password_plain: 'Figma#Billing#Jane#99!', department: 'Finance' },
    { id: 'vc3', name: 'HR Payroll Gusto Login Portal Credentials', url: 'gusto.com', username: 'hr-payroll@omnihub.com', password_masked: '••••••••••••••••', password_plain: 'Gusto#Payroll#Nikhil#88!', department: 'HR Operations' }
  ]);

  const [customFieldsSchema, setCustomFieldsSchema] = useState<CustomFieldSchema[]>([
    { id: 'cf1', name: 'Slack Handle', type: 'text' },
    { id: 'cf2', name: 'Work Location', type: 'dropdown', options: ['HQ - Bangalore', 'HQ - SF', 'Remote - India', 'Remote - USA'] }
  ]);

  const [systemAuditLogs, setSystemAuditLogs] = useState<SystemAuditLog[]>([
    { id: 'a_log1', timestamp: '2026-06-15, 11:10:02 AM', actor_id: 'e4', action: 'User Alex Johnson updated global configuration rules.' },
    { id: 'a_log2', timestamp: '2026-06-15, 10:45:12 AM', actor_id: 'e2', action: 'User John Doe submitted leave request l_1.' }
  ]);

  // Timer interval to increment running tasks
  useEffect(() => {
    const timer = setInterval(() => {
      setProjectTasks(prev => prev.map(task => {
        if (task.timer_active) {
          return { ...task, time_spent: task.time_spent + 1 };
        }
        return task;
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const switchActiveUser = (id: string) => {
    const user = employees.find(e => e.id === id);
    if (user) {
      setActiveUser(user);
      const userPermissions = suitePermissions[user.role];
      if (!userPermissions.includes(activeSuite)) {
        setActiveSuite(userPermissions[0] || 'hr');
      }
      logSystemEvent(user.id, `Logged in and switched active workspace.`);
    }
  };

  const switchSuite = (suite: SuiteName) => {
    if (hasSuiteAccess(activeUser.role, suite)) {
      setActiveSuite(suite);
    }
  };

  const logSystemEvent = (actorId: string, actionText: string) => {
    const newLog: SystemAuditLog = {
      id: `a_log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toLocaleString(),
      actor_id: actorId,
      action: actionText
    };
    setSystemAuditLogs(prev => [newLog, ...prev]);
  };

  // Clock Actions
  const clockInUser = (notes?: string, location?: { lat: number; lng: number }) => {
    const defaultLoc = location || { lat: 12.9716, lng: 77.5946 }; // Default Bangalore HQ
    const newShift: Shift = {
      id: `s_${Date.now()}`,
      employee_id: activeUser.id,
      clock_in: new Date().toLocaleTimeString(),
      clock_out: null,
      notes,
      location: defaultLoc
    };
    setShifts(prev => [newShift, ...prev]);
    setEmployees(prev => prev.map(e => e.id === activeUser.id ? { ...e, status: 'online' } : e));
    setActiveUser(prev => ({ ...prev, status: 'online' }));
    logSystemEvent(activeUser.id, `Clocked in shift with geolocated coordinates [${defaultLoc.lat.toFixed(4)}, ${defaultLoc.lng.toFixed(4)}].`);
  };

  const clockOutUser = (notes?: string) => {
    setShifts(prev => prev.map(s => {
      if (s.employee_id === activeUser.id && s.clock_out === null) {
        return { ...s, clock_out: new Date().toLocaleTimeString(), notes: notes || s.notes };
      }
      return s;
    }));
    setEmployees(prev => prev.map(e => e.id === activeUser.id ? { ...e, status: 'offline' } : e));
    setActiveUser(prev => ({ ...prev, status: 'offline' }));
    logSystemEvent(activeUser.id, `Clocked out shift. Handover note submitted: "${notes || 'None'}".`);
  };

  // Ticket Actions
  const addTicket = (category: any, title: string, description: string, priority: any) => {
    const newTicket: Ticket = {
      id: `t_${Date.now()}`,
      creator_id: activeUser.id,
      assigned_id: null,
      category,
      title,
      description,
      priority,
      status: 'open',
      created_at: new Date().toLocaleDateString(),
    };
    setTickets(prev => [newTicket, ...prev]);
    logSystemEvent(activeUser.id, `Submitted new support ticket ticket ID: ${newTicket.id}.`);
  };

  const addTicketComment = (ticketId: string, message: string) => {
    const newComment: TicketComment = {
      id: `c_${Date.now()}`,
      ticket_id: ticketId,
      sender_id: activeUser.id,
      message,
      created_at: new Date().toLocaleTimeString(),
    };
    setComments(prev => [...prev, newComment]);
    logSystemEvent(activeUser.id, `Replied on support ticket ID: ${ticketId}.`);
  };

  const changeTicketStatus = (ticketId: string, status: any) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
    logSystemEvent(activeUser.id, `Changed ticket ID: ${ticketId} status to ${status}.`);
  };

  const changeTicketAssignment = (ticketId: string, assignedId: string | null) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assigned_id: assignedId } : t));
    logSystemEvent(activeUser.id, `Assigned ticket ID: ${ticketId} to worker ID: ${assignedId || 'Unassigned'}.`);
  };

  // Leave Actions
  const approveLeaveRequest = (requestId: string, status: 'approved' | 'rejected') => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        if (status === 'approved') {
          setEmployees(empPrev => empPrev.map(e => e.id === req.employee_id ? { ...e, status: 'on_leave' } : e));
        }
        return { ...req, status, approved_by: activeUser.id };
      }
      return req;
    }));
    logSystemEvent(activeUser.id, `Reviewed leave request ID: ${requestId} status: ${status}.`);
  };

  const addLeaveRequest = (leaveType: 'sick' | 'casual' | 'annual', startDate: string, endDate: string, reason: string) => {
    const newRequest: LeaveRequest = {
      id: `l_${Date.now()}`,
      employee_id: activeUser.id,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason,
      status: 'pending',
      approved_by: null,
      created_at: new Date().toLocaleDateString(),
    };
    setLeaveRequests(prev => [newRequest, ...prev]);
    logSystemEvent(activeUser.id, `Submitted leave request for ${leaveType} leave.`);
  };

  // Wiki Actions
  const saveWikiDoc = (title: string, content: string, docId?: string) => {
    if (docId) {
      setWikiDocs(prev => prev.map(d => d.id === docId ? { ...d, title, content, updated_at: new Date().toLocaleDateString() } : d));
      logSystemEvent(activeUser.id, `Updated wiki documentation ID: ${docId}.`);
    } else {
      const newDoc: WikiDoc = {
        id: `w_${Date.now()}`,
        title,
        content,
        created_by: activeUser.id,
        updated_at: new Date().toLocaleDateString(),
      };
      setWikiDocs(prev => [newDoc, ...prev]);
      logSystemEvent(activeUser.id, `Created new wiki SOP document: "${title}".`);
    }
  };

  const deleteWikiDoc = (docId: string) => {
    setWikiDocs(prev => prev.filter(d => d.id !== docId));
    logSystemEvent(activeUser.id, `Deleted wiki document ID: ${docId}.`);
  };

  // Announcement Actions
  const postAnnouncement = (title: string, content: string) => {
    const newAnn: Announcement = {
      id: `a_${Date.now()}`,
      title,
      content,
      created_by: activeUser.id,
      created_at: new Date().toLocaleDateString(),
      acknowledged_by: []
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    logSystemEvent(activeUser.id, `Broadcasted announcement notice: "${title}".`);
  };

  const acknowledgeAnnouncement = (annId: string) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id === annId) {
        const ackSet = a.acknowledged_by || [];
        if (!ackSet.includes(activeUser.id)) {
          return { ...a, acknowledged_by: [...ackSet, activeUser.id] };
        }
      }
      return a;
    }));
    logSystemEvent(activeUser.id, `Acknowledged bulletin alert ID: ${annId}.`);
  };

  // Financial Receipt Actions
  const addReceiptClaim = (item: string, amount: number, category: string, imageUrl?: string) => {
    const newClaim: ReceiptClaim = {
      id: `r_${Date.now()}`,
      employee_id: activeUser.id,
      item,
      amount,
      category,
      date: new Date().toLocaleDateString(),
      status: 'pending',
      image_url: imageUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150'
    };
    setReceiptClaims(prev => [newClaim, ...prev]);
    logSystemEvent(activeUser.id, `Submitted expense reimbursement claim: "${item}" for $${amount}.`);
  };

  const approveReceiptClaim = (claimId: string, status: 'approved' | 'rejected') => {
    setReceiptClaims(prev => prev.map(c => c.id === claimId ? { ...c, status } : c));
    logSystemEvent(activeUser.id, `Reviewed receipt expense claim ID: ${claimId} status: ${status}.`);
  };

  // Project Task / Kanban Actions
  const addProjectTask = (title: string, priority: 'low' | 'medium' | 'high', assigneeId: string) => {
    const newTask: ProjectTask = {
      id: `t_p_${Date.now()}`,
      title,
      stage: 'todo',
      priority,
      assignee_id: assigneeId,
      time_spent: 0,
      timer_active: false
    };
    setProjectTasks(prev => [newTask, ...prev]);
    logSystemEvent(activeUser.id, `Created project sprint task: "${title}".`);
  };

  const toggleTaskTimer = (taskId: string) => {
    setProjectTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextState = !t.timer_active;
        logSystemEvent(activeUser.id, `${nextState ? 'Started' : 'Stopped'} active timer on task ID: ${taskId}.`);
        return { ...t, timer_active: nextState };
      }
      // Stop other timers to ensure single task focus
      return { ...t, timer_active: false };
    }));
  };

  const changeTaskStage = (taskId: string, stage: 'todo' | 'inprogress' | 'done') => {
    setProjectTasks(prev => prev.map(t => t.id === taskId ? { ...t, stage } : t));
    logSystemEvent(activeUser.id, `Moved task ID: ${taskId} to stage: ${stage}.`);
  };

  // Facility Actions
  const addRoomBooking = (roomName: string, date: string, startTime: string, endTime: string) => {
    const newBooking: RoomBooking = {
      id: `rb_${Date.now()}`,
      room_name: roomName,
      date,
      start_time: startTime,
      end_time: endTime,
      booker_id: activeUser.id
    };
    setRoomBookings(prev => [newBooking, ...prev]);
    logSystemEvent(activeUser.id, `Reserved meeting room "${roomName}" for date: ${date} (${startTime}-${endTime}).`);
  };

  const addDeskBooking = (deskId: string, date: string) => {
    const newBooking: DeskBooking = {
      id: `db_${Date.now()}`,
      desk_id: deskId,
      date,
      booker_id: activeUser.id
    };
    setDeskBookings(prev => [newBooking, ...prev]);
    logSystemEvent(activeUser.id, `Hoteling booked desk workspace "${deskId}" for date: ${date}.`);
  };

  // Onboarding Actions
  const hireOnboardCandidate = (candidateId: string) => {
    setOnboardingHires(prev => prev.map(h => {
      if (h.id === candidateId) {
        logSystemEvent(activeUser.id, `Marked candidate ${h.name} as Hired. Automatic onboarding provisioning workflow initialized.`);
        return { ...h, status: 'Hired' };
      }
      return h;
    }));
  };

  const updateOnboardingChecklist = (candidateId: string, item: 'it_laptop' | 'hr_payroll' | 'wiki_sop', value: boolean) => {
    setOnboardingHires(prev => prev.map(h => {
      if (h.id === candidateId) {
        const nextChecklist = { ...h.checklist, [item]: value };
        logSystemEvent(activeUser.id, `Updated onboarding item "${item}" for ${h.name} to ${value}.`);
        return { ...h, checklist: nextChecklist };
      }
      return h;
    }));
  };

  // Custom Field Injection
  const addCustomFieldSchema = (name: string, type: 'text' | 'dropdown', options?: string[]) => {
    const newField: CustomFieldSchema = {
      id: `cf_${Date.now()}`,
      name,
      type,
      options
    };
    setCustomFieldsSchema(prev => [...prev, newField]);
    logSystemEvent(activeUser.id, `SuperAdmin dynamically injected custom profile field: "${name}" (${type}).`);
  };

  const updateEmployeeCustomFieldValue = (empId: string, fieldName: string, value: string) => {
    setEmployees(prev => prev.map(e => {
      if (e.id === empId) {
        const updatedFields = { ...e.customFields, [fieldName]: value };
        return { ...e, customFields: updatedFields };
      }
      return e;
    }));
    if (empId === activeUser.id) {
      setActiveUser(prev => ({ ...prev, customFields: { ...prev.customFields, [fieldName]: value } }));
    }
    logSystemEvent(activeUser.id, `Updated custom field "${fieldName}" for worker ID: ${empId}.`);
  };

  return (
    <StateContext.Provider
      value={{
        activeUser,
        activeSuite,
        employees,
        tickets,
        comments,
        shifts,
        leaveRequests,
        wikiDocs,
        announcements,
        permissions,

        // Expanded states
        receiptClaims,
        saasVendors,
        projectTasks,
        okrs,
        reviewScores,
        coachingLogs,
        roomBookings,
        deskBookings,
        onboardingHires,
        vaultCredentials,
        customFieldsSchema,
        systemAuditLogs,

        switchActiveUser,
        switchSuite,
        clockInUser,
        clockOutUser,
        addTicket,
        addTicketComment,
        changeTicketStatus,
        changeTicketAssignment,
        approveLeaveRequest,
        addLeaveRequest,
        saveWikiDoc,
        deleteWikiDoc,
        postAnnouncement,
        acknowledgeAnnouncement,

        // New actions
        addReceiptClaim,
        approveReceiptClaim,
        addProjectTask,
        toggleTaskTimer,
        changeTaskStage,
        addRoomBooking,
        addDeskBooking,
        hireOnboardCandidate,
        updateOnboardingChecklist,
        addCustomFieldSchema,
        updateEmployeeCustomFieldValue
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used inside a StateProvider');
  }
  return context;
}
