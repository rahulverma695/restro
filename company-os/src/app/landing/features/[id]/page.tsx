'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Users, 
  Terminal, 
  Wallet, 
  MessagesSquare, 
  Layers, 
  Activity, 
  Calendar, 
  Briefcase, 
  Key, 
  Settings,
  TrendingUp,
  PhoneCall,
  Send,
  Globe,
  Video,
  ArrowLeft, 
  Check, 
  AlertTriangle,
  Clock,
  HelpCircle,
  Lock,
  Plus,
  Play,
  Square,
  ShieldCheck,
  ClipboardList,
  Eye,
  EyeOff,
  Copy,
  MapPin
} from 'lucide-react';

// ==========================================
// FEATURE SPECIFICATIONS & MARKETING DATA
// ==========================================
const FEATURE_DATA: Record<string, {
  name: string;
  replaces: string;
  monthlySavings: number;
  valueProp: string;
  icon: any;
  steps: string[];
}> = {
  'hr': {
    name: 'HR Operations',
    replaces: 'BambooHR & Rippling ($800/mo)',
    monthlySavings: 800,
    valueProp: 'Unify employee directory records, log geofenced shifts with browser location coordinates, and clear casual leaves requests.',
    icon: Users,
    steps: [
      'Employees register profiles, contact lines, and assigned device assets.',
      'Roster logs check-in location coordinates using browser geofence APIs.',
      'Sick/casual leave requests route directly to manager approval queues.',
      'Offboarding checkmarks trigger automated checklists to lock credentials.'
    ]
  },
  'it': {
    name: 'IT Service Desk',
    replaces: 'Zendesk Service ($735/mo)',
    monthlySavings: 735,
    valueProp: 'A categorized service desk ticketing workspace featuring dynamic SLA timers and multi-agent split-view chats.',
    icon: Terminal,
    steps: [
      'Employees raise tickets under Facility, HR, or IT hardware classes.',
      'Incoming tickets show live SLA countdown timers in manager queues.',
      'Support agents reply in a threaded workspace containing diagnostic stats.',
      'Clocking out requires submitting shift handover notes to keep teams aligned.'
    ]
  },
  'onboarding': {
    name: 'Onboarding Pipelines',
    replaces: 'BambooHR Onboarding ($400/mo)',
    monthlySavings: 400,
    valueProp: 'Guide new candidates through automatic hardware provisioning tickets and check off week-one training SOPs.',
    icon: Briefcase,
    steps: [
      'Marking a candidate "Hired" initializes onboarding checkpoints.',
      'Postgres auto-triggers IT ticket alerts for device provisioning.',
      'New hires view lists of mandatory wiki manuals to review and check off.',
      'Completion timestamps write to the SuperAdmin systems audit log.'
    ]
  },
  'facility': {
    name: 'Facility Booking',
    replaces: 'Robin Rooms ($500/mo)',
    monthlySavings: 500,
    valueProp: 'Interactive office desk hoteling layout maps and conference room schedules that actively block double-bookings.',
    icon: Calendar,
    steps: [
      'Hybrid employees review physical maps of office desks layout.',
      'Clicking a desk reserves the workstation block for selected dates.',
      'Meeting rooms are booked on calendar grids that check scheduling conflicts.',
      'Office occupancy graphs update dynamically on admin dashboard panels.'
    ]
  },
  'vault': {
    name: 'Secure Vault',
    replaces: '1Password ($400/mo)',
    monthlySavings: 400,
    valueProp: 'Store encrypted shared passwords, locked strictly by department RBAC tags with clipboard auditing logs.',
    icon: Key,
    steps: [
      'System encrypts password credentials client-side prior to Postgres storage.',
      'Employees see credentials locked strictly to their department tags.',
      'Credentials remain masked as dots on screen layouts to block snooping.',
      'Copy actions send credentials to clipboard, tracking user logs in audit.'
    ]
  },
  'comms': {
    name: 'Async Comms & Wiki',
    replaces: 'Notion & Slack ($1,200/mo)',
    monthlySavings: 1200,
    valueProp: 'A central wiki manual editor, team chat streams, and global announcements that lock dashboards until acknowledged.',
    icon: MessagesSquare,
    steps: [
      'Write SOP policy folders in a fast-loading markdown builder.',
      'Broadcast critical bulletins to all staff dashboard screens.',
      'Announcements lock views until users click "I Acknowledge" flags.',
      'Logs record signature timestamps, proving policy compliance.'
    ]
  },
  'project': {
    name: 'Project Management',
    replaces: 'Monday.com ($1,000/mo)',
    monthlySavings: 1000,
    valueProp: 'Track department milestones with agile Kanban sprint boards, Gantt chart dependency maps, and billable task timers.',
    icon: Layers,
    steps: [
      'Assign milestone tasks, prioritizing bugs, epics, and features.',
      'Drag cards across Todo, In-Progress, and Done Kanban columns.',
      'Task cards feature timers that log exact hours to compile timesheets.',
      'leads view Gantt timelines to debug overlapping schedule blockages.'
    ]
  },
  'performance': {
    name: 'Performance OKRs',
    replaces: 'Lattice ($600/mo)',
    monthlySavings: 600,
    valueProp: 'Connect company target benchmarks to employee goals, chart 360 peer reviews, and record manager coaching logs.',
    icon: Activity,
    steps: [
      'Leads map high-level company OKRs directly to team checkpoints.',
      'Reps receive coaching feedback logs in persistent 1-on-1 directories.',
      'Complete annual peer, self, and supervisor 360 evaluation forms.',
      'System aggregates ratings, rendering visual radar performance graphs.'
    ]
  },
  'media': {
    name: 'Documents & Media',
    replaces: 'DocuSign & Zoom ($500/mo)',
    monthlySavings: 500,
    valueProp: 'Establish sequential e-signature pipelines with SHA-256 seals, and launch internal video conferencing rooms.',
    icon: Video,
    steps: [
      'Upload service contract drafts or NDA agreements (PDFs).',
      'Drag and drop signature stamps onto layout coordinates.',
      'Email agreements sequentially to signing nodes for execution.',
      'Seal contracts, logging IP addresses and SHA-256 cryptographic hashes.'
    ]
  },
  'finance': {
    name: 'Financial Ledger',
    replaces: 'Expensify ($900/mo)',
    monthlySavings: 900,
    valueProp: 'Streamline reimbursement claims with Gemini OCR receipt reading, and audit renewal dates for third-party SaaS licenses.',
    icon: Wallet,
    steps: [
      'Staff upload images of transaction receipts from client dashboards.',
      'Gemini OCR extracts vendor name, transaction date, and currency total.',
      'Expenses audit checks limits, routing claims to managers for signoff.',
      'Finance leads execute bank reimbursements and monitor SaaS budgets.'
    ]
  },
  'admin': {
    name: 'Command Center',
    replaces: 'Custom Engineering ($500/mo)',
    monthlySavings: 500,
    valueProp: 'Universal control console. Simulate employee profiles, create custom profile fields, and check system logs.',
    icon: Settings,
    steps: [
      'Toggle active profile simulations to view the app through any role.',
      'Create new text or dropdown fields to enrich employee layouts.',
      'Audit log ledgers track every ticket status change and vault copy.',
      'Configure system-wide domain names and transactional mail routes.'
    ]
  },
  'sales': {
    name: 'Sales CRM',
    replaces: 'Salesforce & HubSpot ($7,500/mo)',
    monthlySavings: 7500,
    valueProp: 'Track client lead databases, enforce sales blueprints, bundle quotes, and calculate expected pipeline revenues.',
    icon: TrendingUp,
    steps: [
      'Leads flow automatically into Postgres from forms and live chat hubs.',
      'Sales reps qualify deals, shifting cards across pipeline columns.',
      'CPQ calculators compile product packages, applying volume discounts.',
      'Expected revenue graphs update in real-time, forecasting sales totals.'
    ]
  },
  'touchpoints': {
    name: 'Customer Touchpoints',
    replaces: 'Intercom & Calendly ($500/mo)',
    monthlySavings: 500,
    valueProp: 'A public client scheduling engine calendar, custom web forms builder, and live website support chat queues.',
    icon: PhoneCall,
    steps: [
      'External prospects schedule consultation bookings on calendar grids.',
      'Website visitors initialize chat threads, triggering support agent alerts.',
      'Reps answer chat questions while reviewing leads files side-by-side.',
      'Form submissions auto-create contact profiles in the sales ledger.'
    ]
  },
  'marketing': {
    name: 'Marketing Hub',
    replaces: 'Mailchimp & Smartlead ($350/mo)',
    monthlySavings: 350,
    valueProp: 'Compose email campaigns, verify DNS flags (SPF/DKIM/DMARC), and rotate outgoing domains to prevent spam blocks.',
    icon: Send,
    steps: [
      'Import client lists, grouping email targets by lead tags.',
      'Create campaign text variables to personalize dispatches.',
      'Outbox cycles domains automatically to stay under velocity spam filters.',
      'Survey modules gather feedbacks, logging metrics directly to CRM.'
    ]
  },
  'growth': {
    name: 'Growth Suite',
    replaces: 'Hootsuite ($200/mo)',
    monthlySavings: 200,
    valueProp: 'Write and schedule social announcements across networks, preview posts layouts, and track affiliate partner payouts.',
    icon: Globe,
    steps: [
      'Draft promotional posts and upload marketing visual assets.',
      'Preview post layouts across X, LinkedIn, and Facebook formats.',
      'Schedule dispatches and monitor post engagement click rates.',
      'Track referral accounts payouts in the partner affiliate ledger.'
    ]
  }
};

export default function FeatureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const feat = FEATURE_DATA[id];

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulator States
  // 1. HR
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [punchStatus, setPunchStatus] = useState<'offline' | 'online'>('offline');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [punchLogs, setPunchLogs] = useState<string[]>([]);

  // 2. IT Service Desk
  const [activeTicket, setActiveTicket] = useState('t-1');
  const [ticketsList, setTicketsList] = useState([
    { id: 't-1', title: 'AC broken in room 4', priority: 'High', sla: '12 mins remaining', messages: ['AC blowing hot air since morning.', 'Support: Tech dispatched.'] },
    { id: 't-2', title: 'Need payroll detail update', priority: 'Medium', sla: '2h 15m remaining', messages: ['Want to check direct deposit status.'] }
  ]);
  const [replyText, setReplyText] = useState('');

  // 3. Onboarding Pipelines
  const [hiredCandidates, setHiredCandidates] = useState([
    { id: 'c-1', name: 'Devon Webb', status: 'Hired', itCheck: false, wikiRead: false },
    { id: 'c-2', name: 'Sara Conner', status: 'Hired', itCheck: true, wikiRead: true }
  ]);

  // 4. Facility Booking
  const [bookedDesks, setBookedDesks] = useState<string[]>(['Desk 3']);
  const [bookedRooms, setBookedRooms] = useState([
    { room: 'Boardroom A', time: '11:00 AM - 12:00 PM' }
  ]);
  const [newRoomTime, setNewRoomTime] = useState('12:00 PM - 01:00 PM');

  // 5. Secure Vault
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [vaultLogs, setVaultLogs] = useState<string[]>([]);
  const [activeRBACRole, setActiveRBACRole] = useState<'employee' | 'finance_admin'>('employee');
  const vaultCredentials = [
    { id: 'vc-1', name: 'Instagram Publisher API Key', secret: 'insta_api_key_8841', dept: 'Marketing' },
    { id: 'vc-2', name: 'Company Bank account Ledger', secret: 'cash_vault_ledger_330', dept: 'Finance' }
  ];

  // 6. Async Comms & Wiki
  const [wikiMarkdown, setWikiMarkdown] = useState('# SOP: Guidelines\n\n1. Qualify all leads in CRM.\n2. Log timesheet timers.\n3. Keep passwords in Secure Vault.');
  const [activeWikiTopic, setActiveWikiTopic] = useState<'onboard' | 'security'>('onboard');
  const [showNoticeOverlay, setShowNoticeOverlay] = useState(false);
  const [noticeLogs, setNoticeLogs] = useState<string[]>([]);

  // 7. Project Management
  const [projectTasks, setProjectTasks] = useState([
    { id: 'task-1', title: 'Write integration plan', stage: 'todo' },
    { id: 'task-2', title: 'Deploy Neon database singletons', stage: 'inprogress' }
  ]);

  // 8. Performance OKRs
  const [peerRatings, setPeerRatings] = useState({ quality: 80, speed: 75, comms: 90 });

  // 9. Documents & Media (e-Signatures)
  const [signatureName, setSignatureName] = useState('');
  const [signStamps, setSignStamps] = useState<string[]>([]);
  const [documentSealed, setDocumentSealed] = useState(false);
  const [sealedHash, setSealedHash] = useState('');

  // 10. Financial Ledger
  const [activeVendors, setActiveVendors] = useState([
    { id: 'v-1', name: 'HubSpot', cost: 7500, active: true },
    { id: 'v-2', name: 'Zendesk', cost: 735, active: true }
  ]);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorCost, setNewVendorCost] = useState('');

  // 11. Command Center
  const [simRole, setSimRole] = useState<'SuperAdmin' | 'Employee' | 'HRAdmin'>('SuperAdmin');
  const [customFields, setCustomFields] = useState([{ label: 'Slack Username', type: 'Text' }]);
  const [newFieldName, setNewFieldName] = useState('');

  // 12. Sales CRM
  const [salesDeals, setSalesDeals] = useState([
    { id: 'd-1', title: 'Acme Corp Hub', cost: 12000, stage: 'leads' },
    { id: 'd-2', title: 'Global Logistics Suite', cost: 18000, stage: 'proposal' },
    { id: 'd-3', title: 'Metro Retail OS', cost: 9500, stage: 'won' }
  ]);

  // 13. Customer Touchpoints
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // 14. Marketing Hub
  const [dnsVerified, setDnsVerified] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState('New Product Launch Alert');
  const [campaignRotation, setCampaignRotation] = useState(true);
  const [campaignLogs, setCampaignLogs] = useState<string[]>([]);

  // 15. Growth Suite
  const [socialText, setSocialText] = useState('We are launching Company OS today! Check out the details.');
  const [activePlatformPreview, setActivePlatformPreview] = useState<'x' | 'linkedin'>('x');
  const [socialQueue, setSocialQueue] = useState<string[]>([]);

  if (!mounted) return null;

  if (!feat) {
    return (
      <div className="bg-[#090A09] text-white min-h-screen flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <h1 className="text-xl font-bold">Feature Route Invalid</h1>
        <Link href="/landing" className="px-5 py-2 bg-[#E1FF4B] text-black text-xs font-bold uppercase rounded-lg">Return to Landing</Link>
      </div>
    );
  }

  const FeatIcon = feat.icon;

  // Simulator actions
  // HR
  const handleGeoLookup = () => {
    setGpsLoading(true);
    setTimeout(() => {
      setGpsLocation({ lat: 12.9716, lng: 77.5946 });
      setGpsLoading(false);
    }, 600);
  };

  const handleClockToggle = (mode: 'in' | 'out') => {
    if (mode === 'in') {
      setPunchStatus('online');
      setPunchLogs(prev => [`[${new Date().toLocaleTimeString()}] CLOCKED IN: GPS Verified at (12.9716, 77.5946)`, ...prev]);
    } else {
      if (!handoverNotes.trim()) {
        alert('Handover notes are mandatory for clock-out compliance!');
        return;
      }
      setPunchStatus('offline');
      setPunchLogs(prev => [`[${new Date().toLocaleTimeString()}] CLOCKED OUT: Logged notes: "${handoverNotes}"`, ...prev]);
      setHandoverNotes('');
    }
  };

  // IT Desk
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setTicketsList(prev => prev.map(t => {
      if (t.id === activeTicket) return { ...t, messages: [...t.messages, `Staff Agent: ${replyText}`] };
      return t;
    }));
    setReplyText('');
  };

  // Onboarding
  const toggleOnboardStep = (candId: string, field: 'itCheck' | 'wikiRead') => {
    setHiredCandidates(prev => prev.map(c => {
      if (c.id === candId) return { ...c, [field]: !c[field] };
      return c;
    }));
  };

  // Facility
  const handleDeskToggle = (desk: string) => {
    if (bookedDesks.includes(desk)) {
      setBookedDesks(prev => prev.filter(d => d !== desk));
    } else {
      setBookedDesks(prev => [...prev, desk]);
    }
  };

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookedRooms.some(r => r.time === newRoomTime)) {
      alert('CONFLICT: Room is already booked for this slot!');
      return;
    }
    setBookedRooms(prev => [...prev, { room: 'Boardroom A', time: newRoomTime }]);
  };

  // Vault
  const handleToggleReveal = (credId: string, name: string) => {
    if (revealedIds.includes(credId)) {
      setRevealedIds(prev => prev.filter(id => id !== credId));
    } else {
      setRevealedIds(prev => [...prev, credId]);
      setVaultLogs(prev => [`[${new Date().toLocaleTimeString()}] REVEALED: Secret for "${name}" by role: ${activeRBACRole}`, ...prev]);
    }
  };

  const handleCopyClipboard = (name: string) => {
    setVaultLogs(prev => [`[${new Date().toLocaleTimeString()}] COPIED PASSWORD: Clipboard hash logged for "${name}"`, ...prev]);
    alert(`Copied "${name}" password hash to clipboard!`);
  };

  // Comms
  const handleWikiTopic = (topic: 'onboard' | 'security') => {
    setActiveWikiTopic(topic);
    if (topic === 'onboard') {
      setWikiMarkdown('# SOP: Guidelines\n\n1. Qualify all leads in CRM.\n2. Log timesheet timers.\n3. Keep passwords in Secure Vault.');
    } else {
      setWikiMarkdown('# SOP: Security Protocol\n\n1. Store all client database keys in the secure role-locked vault.\n2. Do not reveal credential strings over team chat.\n3. Log clipboard actions.');
    }
  };

  const handleBroadcastNotice = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNoticeOverlay(true);
  };

  const handleAcknowledge = () => {
    setShowNoticeOverlay(false);
    setNoticeLogs(prev => [`[${new Date().toLocaleTimeString()}] BULLETIN ACKNOWLEDGED: User logged signature`, ...prev]);
  };

  // Project
  const handleMoveTaskStage = (taskId: string, newStage: string) => {
    setProjectTasks(prev => prev.map(t => {
      if (t.id === taskId) return { ...t, stage: newStage };
      return t;
    }));
  };

  // Media (e-Signatures)
  const handlePlaceStamp = (type: string) => {
    setSignStamps(prev => [...prev, `${type} stamp placed`]);
  };

  const handleSealDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim() || signStamps.length === 0) {
      alert('Must place stamps and type signee name to sign!');
      return;
    }
    setDocumentSealed(true);
    setSealedHash('SHA-256: ' + Math.random().toString(16).substring(2, 10).toUpperCase() + 'B99D2F');
  };

  // Finance
  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName || !newVendorCost) return;
    setActiveVendors(prev => [...prev, { id: String(prev.length + 1), name: newVendorName, cost: parseFloat(newVendorCost), active: true }]);
    setNewVendorName('');
    setNewVendorCost('');
  };

  // Admin
  const handleAddFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    setCustomFields(prev => [...prev, { label: newFieldName, type: 'Text' }]);
    setNewFieldName('');
  };

  // Sales CRM
  const handleMoveDealStage = (dealId: string, newStage: string) => {
    setSalesDeals(prev => prev.map(d => {
      if (d.id === dealId) return { ...d, stage: newStage };
      return d;
    }));
  };

  // Touchpoints
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = `Client: ${chatInput}`;
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      let reply = "Support Bot: Thank you. A support lead has been pinged.";
      if (chatInput.toLowerCase().includes('pricing') || chatInput.toLowerCase().includes('cost')) {
        reply = "Support Bot: Company OS is a $9,500 one-time setup fee. Hosting runs on Vercel/Neon free tiers ($0/mo).";
      } else if (chatInput.toLowerCase().includes('feature') || chatInput.toLowerCase().includes('modules')) {
        reply = "Support Bot: We have 15 integrated modules covering CRM, IT desk, Wiki, Kanban, e-Sign, and HR.";
      }
      setChatMessages(prev => [...prev, reply]);
    }, 500);
  };

  const handleBookSlot = (slot: string) => {
    if (bookedSlots.includes(slot)) {
      setBookedSlots(prev => prev.filter(s => s !== slot));
    } else {
      setBookedSlots(prev => [...prev, slot]);
    }
  };

  // Marketing
  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dnsVerified) {
      alert('Please verify DNS TXT flags prior to launching outreach campaigns!');
      return;
    }
    setCampaignLogs(prev => [
      `[${new Date().toLocaleTimeString()}] DISPATCHED: Campaign subject: "${campaignSubject}" to 1,500 clients.`,
      `[${new Date().toLocaleTimeString()}] ROTATION: sender@node-a.com -> sender@node-b.com (Anti-spam rotation active)`,
      ...prev
    ]);
  };

  // Growth
  const handlePublishSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialText.trim()) return;
    setSocialQueue(prev => [`Scheduled: "${socialText}"`, ...prev]);
    setSocialText('');
  };

  return (
    <div className="bg-[#090A09] text-[#E5E7E6] min-h-screen selection:bg-[#E1FF4B] selection:text-black font-sans pb-24 relative">
      
      {/* BULLETIN NOTICE BOARD OVERLAY */}
      {showNoticeOverlay && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-[#121412] border-2 border-red-500 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center gap-2.5 text-red-500">
              <AlertTriangle className="h-6 w-6 animate-pulse" />
              <h3 className="font-extrabold uppercase text-sm tracking-wider">Forced Acknowledgment Bulletin</h3>
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-white">"Emergency Operations Notice"</h4>
              <p className="text-xs text-[#A2A6A2] leading-relaxed font-semibold">
                Critical database maintenance is scheduled tonight at 11:30 PM. Active workspace connections will be synchronized. Please log out prior to the backup window.
              </p>
            </div>
            <button
              onClick={handleAcknowledge}
              className="w-full py-3 bg-[#E1FF4B] hover:bg-[#C0D930] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all"
            >
              Sign Acknowledgment &amp; Unlock Screen
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-[#1A1C19]">
        <Link 
          href="/landing"
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A2A6A2] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to features
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[#E1FF4B] rounded-xl flex items-center justify-center text-black font-black text-xs">
            OS
          </div>
          <span className="font-extrabold text-sm tracking-wider uppercase text-white">Company OS</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <section className="max-w-7xl mx-auto px-6 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: marketing/copy */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1FF4B]/10 border border-[#E1FF4B]/20 text-[#E1FF4B] text-[9px] font-extrabold uppercase tracking-wider">
              <FeatIcon className="h-3 w-3" /> Module Deep Dive
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {feat.name}
            </h1>
            <p className="text-xs text-red-400 font-extrabold uppercase tracking-wide">
              Replaces: {feat.replaces}
            </p>
            <p className="text-sm text-[#A2A6A2] leading-relaxed font-medium">
              {feat.valueProp}
            </p>
          </div>

          <div className="h-[1px] bg-[#1A1C19]" />

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Operational Workflow</h3>
            <ol className="space-y-4">
              {feat.steps.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-xs font-semibold text-[#A2A6A2]">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#1A1C19] border border-[#252824] text-[#E1FF4B] font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right Column: Simulator */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-[#121412] border border-[#1A1C19] rounded-3xl p-6 shadow-2xl relative flex-1 flex flex-col min-h-[480px]">
            <div className="flex justify-between items-center border-b border-[#1A1C19] pb-4 mb-6 shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                <span className="text-[10px] font-black uppercase tracking-wider text-white">Live Simulator Dashboard</span>
              </div>
              <span className="text-[9px] font-extrabold bg-[#1A1C19] border border-[#252824] text-[#5E6258] px-2.5 py-1 rounded uppercase tracking-wider">
                sandbox node active
              </span>
            </div>

            {/* LIVE SIMULATOR RENDERERS */}
            <div className="flex-1 flex flex-col justify-center text-xs">
              
              {/* HR OPERATIONS */}
              {id === 'hr' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl border bg-[#090A09] border-[#1A1C19]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-extrabold uppercase text-[#5E6258]">Geofence Status</span>
                        {gpsLocation ? (
                          <span className="text-[8px] font-black bg-[#3CD070]/10 text-[#3CD070] border border-[#3CD070]/20 px-2 py-0.5 rounded uppercase">Inside SF Geofence</span>
                        ) : (
                          <span className="text-[8px] font-black bg-amber-400/10 text-amber-500 border border-amber-400/20 px-2 py-0.5 rounded uppercase">Awaiting GPS</span>
                        )}
                      </div>

                      {gpsLocation ? (
                        <p className="text-white font-extrabold flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#E1FF4B]" /> SF HQ Bay (12.9716, 77.5946)</p>
                      ) : (
                        <button
                          onClick={handleGeoLookup}
                          disabled={gpsLoading}
                          className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-bold uppercase rounded-lg border border-[#1A1C19]"
                        >
                          {gpsLoading ? 'Checking Geofence...' : 'Locate Browser GPS'}
                        </button>
                      )}
                    </div>

                    {punchStatus === 'online' ? (
                      <div className="space-y-3 p-4 bg-[#3CD070]/5 border border-[#3CD070]/20 rounded-2xl">
                        <div className="flex items-center gap-2 text-[#3CD070] text-[10px] font-extrabold uppercase">
                          <span className="h-2 w-2 rounded-full bg-[#3CD070] animate-ping"></span> Shift Active
                        </div>
                        <input
                          type="text"
                          value={handoverNotes}
                          onChange={(e) => setHandoverNotes(e.target.value)}
                          placeholder="Type handover notes (mandatory)..."
                          className="w-full bg-[#090A09] border border-[#1A1C19] rounded-xl px-3 py-2 text-xs text-white focus:outline-none placeholder-[#5E6258]"
                        />
                        <button onClick={() => handleClockToggle('out')} className="w-full py-2 bg-[#FF3E3E] text-white font-bold uppercase rounded-xl">Clock Out</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleClockToggle('in')}
                        disabled={!gpsLocation}
                        className="w-full py-2 bg-[#E1FF4B] hover:bg-[#C0D930] disabled:bg-[#E1FF4B]/50 text-black font-extrabold uppercase rounded-xl transition-all"
                      >
                        Initialize Shift (Clock In)
                      </button>
                    )}
                  </div>
                  <div className="border-t border-[#1A1C19] pt-3 max-h-[100px] overflow-y-auto">
                    <span className="text-[9px] font-bold text-[#5E6258] uppercase">Punch logs</span>
                    {punchLogs.map((l, i) => (
                      <div key={i} className="font-mono text-[9px] text-[#A2A6A2] leading-tight mt-1">{l}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* IT SERVICE DESK */}
              {id === 'it' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
                  <div className="md:col-span-5 space-y-1.5 flex flex-col">
                    <span className="text-[9px] font-bold text-[#5E6258] uppercase">Queue Triage</span>
                    <div className="space-y-2 flex-1 overflow-y-auto max-h-[220px]">
                      {ticketsList.map(t => (
                        <div 
                          key={t.id} 
                          onClick={() => setActiveTicket(t.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                            activeTicket === t.id ? 'bg-white/5 border-[#E1FF4B]' : 'bg-[#090A09] border-[#1A1C19] hover:bg-white/5'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[8px] font-extrabold uppercase mb-1">
                            <span className="text-white">{t.id}</span>
                            <span className="text-red-400">{t.priority}</span>
                          </div>
                          <h4 className="text-[9px] font-black text-white truncate leading-snug">{t.title}</h4>
                          <p className="text-[8px] text-[#5E6258] mt-1 uppercase font-bold">{t.sla}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-7 flex flex-col justify-between border-l border-[#1A1C19]/60 pl-4">
                    <div className="space-y-2 flex-1">
                      <span className="text-[9px] font-bold text-white uppercase block border-b border-[#1A1C19] pb-2 mb-2">Ticket Chat Stream</span>
                      <div className="space-y-2 max-h-[140px] overflow-y-auto text-[#A2A6A2] font-semibold text-[10px]">
                        {ticketsList.find(t => t.id === activeTicket)?.messages.map((m, idx) => (
                          <div key={idx} className={`p-2 rounded-xl ${m.startsWith('Staff') ? 'bg-[#E1FF4B]/5 border border-[#E1FF4B]/10 text-white' : 'bg-[#090A09] border border-[#1A1C19]'}`}>
                            {m}
                          </div>
                        ))}
                      </div>
                    </div>
                    <form onSubmit={handleSendReply} className="flex gap-2 border-t border-[#1A1C19] pt-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type reply..."
                        className="flex-1 bg-[#090A09] border border-[#1A1C19] rounded-lg px-2 py-1 text-white focus:outline-none"
                      />
                      <button type="submit" className="px-3 bg-[#E1FF4B] text-black font-extrabold rounded-lg uppercase text-[9px]">Send</button>
                    </form>
                  </div>
                </div>
              )}

              {/* ONBOARDING PIPELINES */}
              {id === 'onboarding' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[9px] font-bold text-[#5E6258] uppercase block">Automated Onboarding Checklists</span>
                    <div className="space-y-2">
                      {hiredCandidates.map(cand => (
                        <div key={cand.id} className="bg-[#090A09] border border-[#1A1C19] p-3 rounded-xl flex justify-between items-center">
                          <div>
                            <span className="font-extrabold text-white block">{cand.name}</span>
                            <span className="text-[8px] bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded uppercase font-black">{cand.status}</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => toggleOnboardStep(cand.id, 'itCheck')}
                              className={`px-2 py-1 rounded text-[8px] font-black uppercase border transition-all ${
                                cand.itCheck ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-transparent border-[#1A1C19] text-[#A2A6A2]'
                              }`}
                            >
                              IT Hardware check
                            </button>
                            <button 
                              onClick={() => toggleOnboardStep(cand.id, 'wikiRead')}
                              className={`px-2 py-1 rounded text-[8px] font-black uppercase border transition-all ${
                                cand.wikiRead ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-transparent border-[#1A1C19] text-[#A2A6A2]'
                              }`}
                            >
                              Wiki manual read
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FACILITY BOOKING */}
              {id === 'facility' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-[#5E6258] uppercase block mb-2">Click desk to Book (Desk Hoteling Map)</span>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                      {['Desk 1', 'Desk 2', 'Desk 3', 'Desk 4', 'Desk 5', 'Desk 6'].map(desk => {
                        const isBooked = bookedDesks.includes(desk);
                        return (
                          <div 
                            key={desk} 
                            onClick={() => handleDeskToggle(desk)}
                            className={`p-2 rounded-xl border cursor-pointer font-bold transition-all ${
                              isBooked ? 'bg-red-400/10 border-red-400 text-red-400' : 'bg-[#090A09] border-[#1A1C19] text-white hover:border-[#E1FF4B]'
                            }`}
                          >
                            {desk}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="border-t border-[#1A1C19] pt-3">
                    <span className="text-[9px] font-bold text-[#5E6258] uppercase block mb-1">Book Meeting Room</span>
                    <form onSubmit={handleRoomSubmit} className="flex gap-2">
                      <select value={newRoomTime} onChange={(e) => setNewRoomTime(e.target.value)} className="bg-[#090A09] text-xs border border-[#1A1C19] text-white rounded-lg p-1.5 flex-1">
                        <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                        <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                        <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
                      </select>
                      <button type="submit" className="px-4 bg-[#E1FF4B] text-black font-extrabold rounded-lg uppercase text-[9px]">Book Room</button>
                    </form>
                  </div>
                </div>
              )}

              {/* SECURE VAULT */}
              {id === 'vault' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="flex gap-1.5 shrink-0 border-b border-[#1A1C19] pb-2">
                    <button onClick={() => setActiveRBACRole('employee')} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${activeRBACRole === 'employee' ? 'bg-[#E1FF4B] border-[#C0D930] text-black' : 'bg-transparent border-[#1A1C19]'}`}>Employee Role</button>
                    <button onClick={() => setActiveRBACRole('finance_admin')} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${activeRBACRole === 'finance_admin' ? 'bg-[#E1FF4B] border-[#C0D930] text-black' : 'bg-transparent border-[#1A1C19]'}`}>Finance Admin Role</button>
                  </div>
                  <div className="space-y-2">
                    {vaultCredentials.map(cred => {
                      const isRevealed = revealedIds.includes(cred.id);
                      const isLocked = activeRBACRole === 'employee' && cred.dept === 'Finance';
                      return (
                        <div key={cred.id} className="flex justify-between items-center bg-[#090A09] border border-[#1A1C19] rounded-xl p-3.5">
                          <div>
                            <span className="font-extrabold text-white block">{cred.name}</span>
                            <span className="text-[8px] font-bold text-[#5E6258] uppercase">Dept lock: {cred.dept}</span>
                          </div>
                          {isLocked ? (
                            <span className="text-[8px] font-black text-red-400 bg-red-400/10 border border-red-400/20 px-2 rounded uppercase flex items-center gap-1"><Lock className="h-3 w-3" /> RBAC Locked</span>
                          ) : (
                            <div className="flex gap-2">
                              <span className="font-mono text-[#E1FF4B] bg-[#121412] px-2 py-1 rounded border border-[#1A1C19]">
                                {isRevealed ? cred.secret : '••••••••••••'}
                              </span>
                              <button onClick={() => handleToggleReveal(cred.id, cred.name)} className="p-1 bg-white/5 border border-[#1A1C19] rounded text-[#A2A6A2] hover:text-white"><Eye className="h-3 w-3" /></button>
                              <button onClick={() => handleCopyClipboard(cred.name)} className="p-1 bg-white/5 border border-[#1A1C19] rounded text-[#A2A6A2] hover:text-white"><Copy className="h-3 w-3" /></button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-[#1A1C19] pt-2 max-h-[80px] overflow-y-auto">
                    <span className="text-[8px] font-bold text-[#5E6258] uppercase">SIEM Auditing Log</span>
                    {vaultLogs.map((log, idx) => (
                      <div key={idx} className="font-mono text-[8px] text-[#A2A6A2] mt-1">{log}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* ASYNC COMMS & WIKI */}
              {id === 'comms' && (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleWikiTopic('onboard')} className={`px-3 py-1 rounded text-[9px] font-extrabold uppercase border ${activeWikiTopic === 'onboard' ? 'bg-[#E1FF4B] border-[#C0D930] text-black' : 'bg-transparent border-[#1A1C19] text-[#A2A6A2]'}`}>Onboarding SOP</button>
                    <button onClick={() => handleWikiTopic('security')} className={`px-3 py-1 rounded text-[9px] font-extrabold uppercase border ${activeWikiTopic === 'security' ? 'bg-[#E1FF4B] border-[#C0D930] text-black' : 'bg-transparent border-[#1A1C19] text-[#A2A6A2]'}`}>Security SOP</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <textarea value={wikiMarkdown} onChange={(e) => setWikiMarkdown(e.target.value)} className="w-full bg-[#090A09] border border-[#1A1C19] rounded-xl p-2 text-xs text-white focus:outline-none resize-none font-mono" />
                    <div className="w-full bg-[#090A09] border border-[#1A1C19] rounded-xl p-2 overflow-y-auto text-xs text-[#A2A6A2] whitespace-pre-wrap">{wikiMarkdown}</div>
                  </div>
                  <button onClick={handleBroadcastNotice} className="w-full py-2 bg-[#FF3E3E] text-white font-extrabold uppercase rounded-lg">Broadcast Warning Popup Notice</button>
                </div>
              )}

              {/* PROJECT MANAGEMENT */}
              {id === 'project' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-[#5E6258] uppercase block">Agile Kanban Workspace</span>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div className="bg-[#090A09] border border-[#1A1C19] p-3 rounded-2xl space-y-2">
                      <span className="text-[8px] font-black uppercase text-[#5E6258]">To Do</span>
                      {projectTasks.filter(t => t.stage === 'todo').map(t => (
                        <div key={t.id} className="bg-[#121412] p-2.5 border border-[#1A1C19] rounded-xl flex justify-between items-center text-[10px]">
                          <span className="font-extrabold text-white">{t.title}</span>
                          <button onClick={() => handleMoveTaskStage(t.id, 'inprogress')} className="p-1 bg-[#E1FF4B] text-black rounded font-black text-[8px] uppercase">Start</button>
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#090A09] border border-[#1A1C19] p-3 rounded-2xl space-y-2">
                      <span className="text-[8px] font-black uppercase text-[#5E6258]">In Progress</span>
                      {projectTasks.filter(t => t.stage === 'inprogress').map(t => (
                        <div key={t.id} className="bg-[#121412] p-2.5 border border-[#1A1C19] rounded-xl flex justify-between items-center text-[10px]">
                          <span className="font-extrabold text-white">{t.title}</span>
                          <button onClick={() => handleMoveTaskStage(t.id, 'todo')} className="p-1 bg-[#FF3E3E] text-white rounded font-black text-[8px] uppercase">Stop</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PERFORMANCE OKRS */}
              {id === 'performance' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-[#5E6258] uppercase block">360 Review Performance Matrix</span>
                  <div className="space-y-3 bg-[#090A09] border border-[#1A1C19] p-4 rounded-2xl">
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-[10px]"><span>Deliverable Quality:</span><span className="text-[#E1FF4B]">{peerRatings.quality}%</span></div>
                      <div className="h-1.5 bg-[#121412] rounded-full overflow-hidden"><div className="bg-[#E1FF4B] h-full" style={{ width: `${peerRatings.quality}%` }}></div></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-[10px]"><span>Roster Velocity:</span><span className="text-white">{peerRatings.speed}%</span></div>
                      <div className="h-1.5 bg-[#121412] rounded-full overflow-hidden"><div className="bg-white h-full" style={{ width: `${peerRatings.speed}%` }}></div></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-[10px]"><span>Team Communication:</span><span className="text-white">{peerRatings.comms}%</span></div>
                      <div className="h-1.5 bg-[#121412] rounded-full overflow-hidden"><div className="bg-white h-full" style={{ width: `${peerRatings.comms}%` }}></div></div>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCUMENTS & MEDIA */}
              {id === 'media' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="bg-[#090A09] border border-[#1A1C19] p-4 rounded-2xl space-y-3 relative overflow-hidden">
                    <span className="text-[8px] uppercase tracking-wider text-[#5E6258] font-bold block">Digital Contract Canvas</span>
                    <p className="text-[10px] text-white font-extrabold">"I agree to deploy Company OS with a setup fee of $9,500."</p>
                    
                    <div className="flex gap-2">
                      <button onClick={() => handlePlaceStamp('Signature')} className="px-2.5 py-1 bg-white/5 border border-[#1A1C19] rounded hover:border-[#E1FF4B] text-[8px] uppercase font-black text-[#A2A6A2] hover:text-white">Place Signature Block</button>
                      <button onClick={() => handlePlaceStamp('Date')} className="px-2.5 py-1 bg-white/5 border border-[#1A1C19] rounded hover:border-[#E1FF4B] text-[8px] uppercase font-black text-[#A2A6A2] hover:text-white">Place Date Block</button>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[9px] font-mono text-[#E1FF4B]">
                      {signStamps.map((s, idx) => (
                        <div key={idx} className="bg-[#121412] px-2 py-0.5 rounded border border-[#1A1C19]">{s}</div>
                      ))}
                    </div>

                    {documentSealed && (
                      <div className="p-2.5 bg-[#3CD070]/10 border border-[#3CD070]/30 rounded-xl text-[9px] font-mono text-[#3CD070] uppercase leading-tight">
                        Sealed successfully! <span className="block mt-1 font-bold">{sealedHash}</span>
                      </div>
                    )}
                  </div>

                  {!documentSealed && (
                    <form onSubmit={handleSealDocument} className="flex gap-2 border-t border-[#1A1C19] pt-3">
                      <input 
                        type="text" 
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        placeholder="Type Signee Name..."
                        className="flex-1 bg-[#090A09] border border-[#1A1C19] rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-[#E1FF4B]/30"
                      />
                      <button type="submit" className="px-4 bg-[#E1FF4B] text-black font-extrabold rounded-lg uppercase text-[9px]">Seal &amp; Sign</button>
                    </form>
                  )}
                </div>
              )}

              {/* FINANCIAL LEDGER */}
              {id === 'finance' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-[#5E6258] uppercase block">Vendor Subscriptions</span>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                      {activeVendors.map(vendor => (
                        <div key={vendor.id} className="flex justify-between items-center bg-[#090A09] border border-[#1A1C19] p-2 rounded-xl text-[10px]">
                          <span className="font-extrabold text-white">{vendor.name}</span>
                          <span className="text-[#E1FF4B] font-bold">${vendor.cost}/mo</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <form onSubmit={handleAddVendor} className="flex gap-2 border-t border-[#1A1C19] pt-3">
                    <input type="text" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} placeholder="Vendor" required className="flex-1 bg-[#090A09] border border-[#1A1C19] rounded-lg px-2 py-1 text-white focus:outline-none" />
                    <input type="number" value={newVendorCost} onChange={(e) => setNewVendorCost(e.target.value)} placeholder="Cost" required className="w-20 bg-[#090A09] border border-[#1A1C19] rounded-lg px-2 py-1 text-white focus:outline-none" />
                    <button type="submit" className="px-4 bg-[#E1FF4B] text-black font-extrabold rounded-lg uppercase text-[9px]">Add</button>
                  </form>
                </div>
              )}

              {/* COMMAND CENTER */}
              {id === 'admin' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b border-[#1A1C19] pb-2">
                    <span className="text-[9px] font-bold text-[#5E6258] uppercase">Profile customizer</span>
                    <select value={simRole} onChange={(e) => setSimRole(e.target.value as any)} className="bg-[#090A09] border border-[#1A1C19] text-white rounded text-[9px] font-bold p-0.5">
                      <option value="SuperAdmin">SuperAdmin</option>
                      <option value="HRAdmin">HRAdmin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    {customFields.map(f => (
                      <div key={f.label} className="flex justify-between items-center text-[9px] bg-[#090A09] border border-[#1A1C19] p-2 rounded-lg">
                        <span className="font-extrabold text-white">{f.label}</span>
                        <span className="text-[#5E6258] font-bold uppercase">{f.type}</span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleAddFieldSubmit} className="flex gap-2 border-t border-[#1A1C19] pt-3">
                    <input type="text" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} placeholder="New Profile Field..." required className="flex-1 bg-[#090A09] border border-[#1A1C19] rounded-lg px-2 py-1 text-white focus:outline-none" />
                    <button type="submit" className="px-4 bg-[#E1FF4B] text-black font-extrabold rounded-lg uppercase text-[9px]">Inject</button>
                  </form>
                </div>
              )}

              {/* SALES CRM */}
              {id === 'sales' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-2 shrink-0">
                    <span className="text-[9px] font-bold text-[#5E6258] uppercase block">Sales CRM Deal pipeline</span>
                    <span className="text-xs font-black text-white">Expected Rev: ${salesDeals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.cost, 0).toLocaleString('en-US')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <div className="bg-[#090A09] border border-[#1A1C19] p-2.5 rounded-xl space-y-1.5">
                      <span className="text-[8px] font-black text-[#5E6258] uppercase">Leads</span>
                      {salesDeals.filter(d => d.stage === 'leads').map(d => (
                        <div key={d.id} className="bg-[#121412] p-2 border border-[#1A1C19] rounded-lg text-[9px] flex justify-between items-center">
                          <div><span className="font-extrabold text-white block truncate w-16">{d.title}</span><span className="text-[8px] text-[#A2A6A2] font-semibold">${d.cost}</span></div>
                          <button onClick={() => handleMoveDealStage(d.id, 'proposal')} className="p-0.5 bg-[#E1FF4B] text-black rounded text-[7px] uppercase font-black">Move</button>
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#090A09] border border-[#1A1C19] p-2.5 rounded-xl space-y-1.5">
                      <span className="text-[8px] font-black text-[#5E6258] uppercase">Proposal</span>
                      {salesDeals.filter(d => d.stage === 'proposal').map(d => (
                        <div key={d.id} className="bg-[#121412] p-2 border border-[#1A1C19] rounded-lg text-[9px] flex justify-between items-center">
                          <div><span className="font-extrabold text-white block truncate w-16">{d.title}</span><span className="text-[8px] text-[#A2A6A2] font-semibold">${d.cost}</span></div>
                          <button onClick={() => handleMoveDealStage(d.id, 'won')} className="p-0.5 bg-[#E1FF4B] text-black rounded text-[7px] uppercase font-black">Won</button>
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#090A09] border border-[#1A1C19] p-2.5 rounded-xl space-y-1.5">
                      <span className="text-[8px] font-black text-[#5E6258] uppercase">Won</span>
                      {salesDeals.filter(d => d.stage === 'won').map(d => (
                        <div key={d.id} className="bg-[#121412] p-2 border border-[#1A1C19] rounded-lg text-[9px] flex justify-between items-center">
                          <div><span className="font-extrabold text-white block truncate w-20">{d.title}</span><span className="text-[8px] text-green-400 font-bold">${d.cost}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CUSTOMER TOUCHPOINTS */}
              {id === 'touchpoints' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
                  <div className="md:col-span-6 space-y-2 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-[#5E6258] uppercase block">Live Website Chat</span>
                    <div className="flex-1 bg-[#090A09] border border-[#1A1C19] rounded-xl p-3 overflow-y-auto max-h-[140px] space-y-1.5 text-[9px] font-semibold">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`p-1.5 rounded-lg ${msg.startsWith('Client') ? 'bg-white/5 border border-[#1A1C19] text-white text-right' : 'bg-[#E1FF4B]/5 border border-[#E1FF4B]/10 text-[#E1FF4B]'}`}>
                          {msg}
                        </div>
                      ))}
                      {chatMessages.length === 0 && <p className="italic text-[#5E6258] text-center pt-6">Ask support a question (e.g. "pricing?")</p>}
                    </div>
                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                      <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type msg..." className="flex-1 bg-[#090A09] border border-[#1A1C19] rounded-lg px-2 py-1 text-white focus:outline-none" />
                      <button type="submit" className="px-3 bg-[#E1FF4B] text-black font-extrabold rounded-lg uppercase text-[9px]">Send</button>
                    </form>
                  </div>
                  <div className="md:col-span-6 border-l border-[#1A1C19]/60 pl-4 space-y-2 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-[#5E6258] uppercase block">Scheduler Booking Grid</span>
                    <div className="grid grid-cols-2 gap-2 text-center text-[9px] font-bold">
                      {['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <div 
                            key={slot} 
                            onClick={() => handleBookSlot(slot)} 
                            className={`p-2 rounded-lg border cursor-pointer ${
                              isBooked ? 'bg-[#3CD070]/10 border-[#3CD070] text-[#3CD070]' : 'bg-[#090A09] border-[#1A1C19] text-white hover:border-[#E1FF4B]'
                            }`}
                          >
                            {slot}
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-2 bg-[#E1FF4B]/5 border border-[#E1FF4B]/10 rounded-lg text-[8px] text-[#A2A6A2]">
                      Click slots to schedule a consultation booking instantly.
                    </div>
                  </div>
                </div>
              )}

              {/* MARKETING HUB */}
              {id === 'marketing' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <form onSubmit={handleLaunchCampaign} className="md:col-span-7 space-y-3 bg-[#090A09] border border-[#1A1C19] p-4 rounded-2xl">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#5E6258] uppercase">Subject Line</label>
                        <input type="text" value={campaignSubject} onChange={(e) => setCampaignSubject(e.target.value)} className="w-full bg-[#121412] border border-[#1A1C19] rounded-lg p-1.5 text-white" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-[#A2A6A2]">Multi-Domain Rotation</span>
                        <input type="checkbox" checked={campaignRotation} onChange={() => setCampaignRotation(!campaignRotation)} className="rounded" />
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setDnsVerified(true)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-extrabold uppercase border ${dnsVerified ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-white/5 border-[#1A1C19]'}`}>
                          {dnsVerified ? 'DNS verified (SPF/DKIM/DMARC)' : 'Verify DNS TXT flags'}
                        </button>
                        <button type="submit" className="px-4 bg-[#E1FF4B] text-black font-extrabold rounded-lg uppercase text-[9px]">Launch Campaign</button>
                      </div>
                    </form>
                    <div className="md:col-span-5 space-y-2 border-l border-[#1A1C19]/60 pl-4 max-h-[160px] overflow-y-auto">
                      <span className="text-[9px] font-bold text-[#5E6258] uppercase block">Campaign Output</span>
                      {campaignLogs.map((log, i) => (
                        <div key={i} className="font-mono text-[8px] text-[#A2A6A2] leading-tight mt-1">{log}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* GROWTH SUITE */}
              {id === 'growth' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4">
                    <form onSubmit={handlePublishSocial} className="space-y-3">
                      <span className="text-[9px] font-bold text-[#5E6258] uppercase block">Social media publisher</span>
                      <textarea value={socialText} onChange={(e) => setSocialText(e.target.value)} rows={3} className="w-full bg-[#090A09] border border-[#1A1C19] rounded-lg p-2 text-white resize-none" />
                      <button type="submit" className="w-full py-2 bg-[#E1FF4B] text-black font-extrabold uppercase rounded-lg text-[9px]">Schedule Broadcast</button>
                    </form>
                    <div className="space-y-2 border-l border-[#1A1C19]/60 pl-4">
                      <div className="flex gap-1.5 border-b border-[#1A1C19] pb-1.5 mb-2 shrink-0">
                        <button onClick={() => setActivePlatformPreview('x')} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${activePlatformPreview === 'x' ? 'bg-[#E1FF4B] text-black' : 'bg-transparent text-[#A2A6A2]'}`}>X layout</button>
                        <button onClick={() => setActivePlatformPreview('linkedin')} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${activePlatformPreview === 'linkedin' ? 'bg-[#E1FF4B] text-black' : 'bg-transparent text-[#A2A6A2]'}`}>LinkedIn layout</button>
                      </div>
                      <div className="p-3 bg-[#090A09] border border-[#1A1C19] rounded-xl text-[10px] text-white">
                        <p className="font-extrabold text-[8px] uppercase tracking-wider text-[#5E6258] mb-1">{activePlatformPreview === 'x' ? '@CompanyOS' : 'Company OS Intranet'}</p>
                        <p className="leading-relaxed font-semibold italic text-[#A2A6A2]">"{socialText || '...'}"</p>
                      </div>
                      <div className="max-h-[60px] overflow-y-auto text-[8px] text-[#A2A6A2] font-mono leading-tight">
                        {socialQueue.map((s, idx) => (
                          <div key={idx} className="border-b border-[#1A1C19]/40 py-1">{s}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
