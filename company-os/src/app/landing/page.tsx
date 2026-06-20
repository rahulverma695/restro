'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ArrowRight, 
  Check, 
  X,
  TrendingDown,
  Sparkles,
  ClipboardList,
  MapPin,
  Clock,
  HelpCircle,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Plus
} from 'lucide-react';

const SAAS_COMPARSION = [
  { tool: 'HubSpot / Salesforce', purpose: 'Sales CRM & pipeline deals tracking', monthly: 7500, annual: 90000 },
  { tool: 'BambooHR', purpose: 'HRMS employee directory & leaves balance', monthly: 800, annual: 9600 },
  { tool: 'Robin PMS', purpose: 'Conference room calendar & desk bookings', monthly: 500, annual: 6000 },
  { tool: 'Notion / Confluence', purpose: 'Standard SOP wikis & policy manuals', monthly: 1000, annual: 12000 },
  { tool: 'Zendesk / Freshdesk', purpose: 'IT & HR ticketing response desks', monthly: 735, annual: 8820 },
  { tool: '1Password', purpose: 'Role-locked corporate passwords sharing', monthly: 400, annual: 4800 },
];

const TOUR_SUITES = [
  { id: 'sales', name: 'Sales CRM', icon: TrendingUp, replaces: 'Salesforce', color: 'text-blue-400' },
  { id: 'hr', name: 'HR Operations', icon: Users, replaces: 'BambooHR', color: 'text-green-400' },
  { id: 'it', name: 'IT Service Desk', icon: Terminal, replaces: 'Zendesk', color: 'text-red-400' },
  { id: 'finance', name: 'Financial Ledger', icon: Wallet, replaces: 'Expensify', color: 'text-emerald-400' },
  { id: 'comms', name: 'Async Comms', icon: MessagesSquare, replaces: 'Slack & Notion', color: 'text-indigo-400' },
  { id: 'project', name: 'Projects & Kanban', icon: Layers, replaces: 'Monday.com', color: 'text-amber-400' },
  { id: 'performance', name: 'Performance OKRs', icon: Activity, replaces: 'Lattice', color: 'text-teal-400' },
  { id: 'facility', name: 'Facility Booking', icon: Calendar, replaces: 'Robin', color: 'text-cyan-400' },
  { id: 'onboarding', name: 'Onboarding Logs', icon: Briefcase, replaces: 'Rippling', color: 'text-sky-400' },
  { id: 'vault', name: 'Secure Vault', icon: Key, replaces: '1Password', color: 'text-rose-400' },
  { id: 'admin', name: 'Command Center', icon: Settings, replaces: 'Custom DB Scripts', color: 'text-orange-400' },
  { id: 'touchpoints', name: 'Touchpoints', icon: PhoneCall, replaces: 'Calendly & Chat', color: 'text-pink-400' },
  { id: 'marketing', name: 'Marketing Hub', icon: Send, replaces: 'Mailchimp', color: 'text-violet-400' },
  { id: 'growth', name: 'Growth Suite', icon: Globe, replaces: 'Hootsuite', color: 'text-fuchsia-400' },
  { id: 'media', name: 'Documents & Media', icon: Video, replaces: 'DocuSign', color: 'text-lime-400' }
];

const CATEGORIZED_FEATURES = [
  {
    category: 'Core Intranet Operations',
    items: [
      { id: 'hr', name: 'HR Operations', replaces: 'BambooHR', icon: Users, gradient: 'from-[#FFA726] to-[#F57C00]', shortDesc: 'Roster & Attendance' },
      { id: 'it', name: 'IT Service Desk', replaces: 'Freshservice', icon: Terminal, gradient: 'from-[#29B6F6] to-[#0288D1]', shortDesc: 'SLA Ticketing & Handovers' },
      { id: 'onboarding', name: 'Onboarding Pipelines', replaces: 'Rippling', icon: Briefcase, gradient: 'from-[#26C6DA] to-[#0097A7]', shortDesc: 'Checklists & ATS' },
      { id: 'facility', name: 'Facility Booking', replaces: 'Robin', icon: Calendar, gradient: 'from-[#EC407A] to-[#C2185B]', shortDesc: 'Rooms & Hoteling' },
      { id: 'vault', name: 'Secure Vault', replaces: '1Password', icon: Key, gradient: 'from-[#FF7043] to-[#E64A19]', shortDesc: 'Credentials RBAC' }
    ]
  },
  {
    category: 'Collaboration & Productivity',
    items: [
      { id: 'comms', name: 'Async Comms', replaces: 'Notion & Slack', icon: MessagesSquare, gradient: 'from-[#AB47BC] to-[#7B1FA2]', shortDesc: 'Wiki SOPs & Team Chat' },
      { id: 'project', name: 'Projects & Kanban', replaces: 'Monday.com', icon: Layers, gradient: 'from-[#66BB6A] to-[#388E3C]', shortDesc: 'Sprint Cards & Timers' },
      { id: 'performance', name: 'Performance OKRs', replaces: 'Lattice', icon: Activity, gradient: 'from-[#26A69A] to-[#00796B]', shortDesc: 'Reviews & Goals' },
      { id: 'media', name: 'Documents & Media', replaces: 'DocuSign', icon: Video, gradient: 'from-[#9CCC65] to-[#689F38]', shortDesc: 'e-Sign & Video Calls' }
    ]
  },
  {
    category: 'Financial & Controls',
    items: [
      { id: 'finance', name: 'Financial Ledger', replaces: 'Expensify', icon: Wallet, gradient: 'from-[#10B981] to-[#047857]', shortDesc: 'Expenses & SaaS Costs' },
      { id: 'admin', name: 'Command Center', replaces: 'DB Scripts', icon: Settings, gradient: 'from-[#78909C] to-[#455A64]', shortDesc: 'RBAC & Audits' }
    ]
  },
  {
    category: 'Sales & Growth Operations',
    items: [
      { id: 'sales', name: 'Sales CRM', replaces: 'Salesforce', icon: TrendingUp, gradient: 'from-[#FF4E4E] to-[#D32F2F]', shortDesc: 'Pipeline & Deals' },
      { id: 'touchpoints', name: 'Customer Touchpoints', replaces: 'Calendly', icon: PhoneCall, gradient: 'from-[#FF5252] to-[#FF1744]', shortDesc: 'Forms & Live Chats' },
      { id: 'marketing', name: 'Marketing Hub', replaces: 'Mailchimp', icon: Send, gradient: 'from-[#7E57C2] to-[#512DA8]', shortDesc: 'Drips & Domains' },
      { id: 'growth', name: 'Growth Suite', replaces: 'Hootsuite', icon: Globe, gradient: 'from-[#D81B60] to-[#880E4F]', shortDesc: 'Socials & Affiliates' }
    ]
  }
];

const SIMULATED_EVENTS = [
  '[Sales] Qualified lead Acme Corp (Hub)',
  '[HR] Clock-in verified SF Office (12.9716, 77.5946)',
  '[IT] Helpdesk SLA Ticket #t-1 resolved (SLA met)',
  '[Finance] Vendor SaaS sub disabled (Saved $7,500/mo)',
  '[Vault] Instagram API Key credential accessed by Marketing',
  '[Project] Moved task "Deploy Neon databases" to In Progress',
  '[Performance] Company goals alignment score synced to 92%',
  '[Facility] Booked Boardroom A slot (12:00 PM - 01:00 PM)',
  '[Onboarding] Cand. Sara Conner training checklists provisioned',
  '[Admin] Injected profile custom field "Slack Username"',
  '[Touchpoints] Support chat route active (Client queued)',
  '[Marketing] Automated drip campaign dispatched via SPF/DKIM Node',
  '[Growth] Scheduled announcement LinkedIn preview cached',
  '[Media] SHA-256 sealed contract "acme_os_licensing.pdf" signed'
];

export default function MarketingLanding() {
  const saasMonthlyTotal = SAAS_COMPARSION.reduce((acc, curr) => acc + curr.monthly, 0);
  const saasAnnualTotal = SAAS_COMPARSION.reduce((acc, curr) => acc + curr.annual, 0);

  // Live Telemetry Vitals ("MICRORITM")
  const [telemetry, setTelemetry] = React.useState({
    dbLatency: 11,
    cpuLoad: 14,
    nodes: 24,
    history: [12, 14, 13, 16, 15, 14, 18, 15, 17, 13]
  });
  const [logsList, setLogsList] = React.useState<string[]>([
    `[12:00:00] Initializing Company OS Node v0.1.0...`,
    `[12:00:01] Connecting database...`,
    `[12:00:02] System active.`
  ]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const nextCpu = Math.floor(Math.random() * 8) + 12; // 12-19%
        const nextLatency = Math.floor(Math.random() * 6) + 8; // 8-13ms
        const nextNodes = Math.floor(Math.random() * 5) + 22; // 22-26
        const nextHistory = [...prev.history.slice(1), nextCpu];
        return {
          dbLatency: nextLatency,
          cpuLoad: nextCpu,
          nodes: nextNodes,
          history: nextHistory
        };
      });

      setLogsList(prev => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        const randomEvent = SIMULATED_EVENTS[Math.floor(Math.random() * SIMULATED_EVENTS.length)];
        const nextLogs = [`[${time}] ${randomEvent}`, ...prev];
        return nextLogs.slice(0, 4); // Limit to 4 logs
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Tour Active Suite
  const [activeTourSuite, setActiveTourSuite] = useState('sales');

  // Tour Simulators States
  // 1. Sales CRM
  const [salesDeals, setSalesDeals] = useState([
    { id: 'd-1', title: 'Acme Corp Hub', cost: 12000, stage: 'leads' },
    { id: 'd-2', title: 'Global Logistics Suite', cost: 18000, stage: 'proposal' },
    { id: 'd-3', title: 'Metro Retail OS', cost: 9500, stage: 'won' }
  ]);
  const handleMoveDeal = (dealId: string, newStage: string) => {
    setSalesDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
  };

  // 2. HR Operations
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [punchStatus, setPunchStatus] = useState<'offline' | 'online'>('offline');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [punchLogs, setPunchLogs] = useState<string[]>([]);
  const handleGpsVerify = () => {
    setGpsLocation({ lat: 12.9716, lng: 77.5946 });
  };
  const handleClockToggle = (mode: 'in' | 'out') => {
    if (mode === 'in') {
      setPunchStatus('online');
      setPunchLogs(prev => [`[${new Date().toLocaleTimeString()}] CLOCKED IN: (12.9716, 77.5946)`, ...prev]);
    } else {
      if (!handoverNotes.trim()) {
        alert('Handover notes are mandatory for clock-out compliance!');
        return;
      }
      setPunchStatus('offline');
      setPunchLogs(prev => [`[${new Date().toLocaleTimeString()}] CLOCKED OUT: Notes: "${handoverNotes}"`, ...prev]);
      setHandoverNotes('');
    }
  };

  // 3. IT Desk
  const [activeTicket, setActiveTicket] = useState('t-1');
  const [ticketsList, setTicketsList] = useState([
    { id: 't-1', title: 'Conference room A AC failure', priority: 'High', sla: '12 mins remaining', messages: ['AC blowing hot air since morning.', 'Support: Tech dispatched.'] },
    { id: 't-2', title: 'Need payroll direct deposit setup', priority: 'Medium', sla: '2h 15m remaining', messages: ['Want to update direct deposit routing.'] }
  ]);
  const [replyText, setReplyText] = useState('');
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setTicketsList(prev => prev.map(t => t.id === activeTicket ? { ...t, messages: [...t.messages, `Staff: ${replyText}`] } : t));
    setReplyText('');
  };

  // 4. Finance
  const [activeVendors, setActiveVendors] = useState([
    { id: 'v-1', name: 'HubSpot', cost: 7500, active: true },
    { id: 'v-2', name: 'Zendesk', cost: 735, active: true },
    { id: 'v-3', name: 'Monday.com', cost: 1000, active: true }
  ]);
  const handleToggleVendor = (vendorId: string) => {
    setActiveVendors(prev => prev.map(v => v.id === vendorId ? { ...v, active: !v.active } : v));
  };

  // 5. Comms
  const [wikiMarkdown, setWikiMarkdown] = useState(`# SOP: Guidelines

1. Qualify all leads in CRM.
2. Log timesheet timers.
3. Keep passwords in Secure Vault.`);
  const [chatMessages, setChatMessages] = useState<string[]>(['John Doe: Just clocked in from Bengaluru office.', 'Jane Smith: Approved John\'s leave requests.']);
  const [chatInput, setChatInput] = useState('');
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, `Me: ${chatInput}`]);
    setChatInput('');
  };

  // 6. Project
  const [projectTasks, setProjectTasks] = useState([
    { id: 'pt-1', title: 'Write integration plan', stage: 'todo' },
    { id: 'pt-2', title: 'Deploy Neon database singletons', stage: 'inprogress' }
  ]);
  const handleMoveTask = (taskId: string, stage: string) => {
    setProjectTasks(prev => prev.map(t => t.id === taskId ? { ...t, stage } : t));
  };

  // 7. Performance OKRs
  const [companyGoals, setCompanyGoals] = useState([
    { title: 'Onboard 10 Mid-Market Clients', progress: 70 },
    { title: 'Maintain Helpdesk SLA Uptime > 98%', progress: 95 }
  ]);

  // 8. Facility Booking
  const [bookedDesks, setBookedDesks] = useState<string[]>(['Desk 3']);
  const [bookedRooms, setBookedRooms] = useState([
    { room: 'Boardroom A', time: '11:00 AM - 12:00 PM' }
  ]);
  const [newRoomTime, setNewRoomTime] = useState('12:00 PM - 01:00 PM');
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

  // 9. Onboarding
  const [hiredCandidates, setHiredCandidates] = useState([
    { id: 'c-1', name: 'Devon Webb', status: 'Hired', itCheck: false, wikiRead: false },
    { id: 'c-2', name: 'Sara Conner', status: 'Hired', itCheck: true, wikiRead: true }
  ]);
  const toggleOnboardStep = (candId: string, field: 'itCheck' | 'wikiRead') => {
    setHiredCandidates(prev => prev.map(c => c.id === candId ? { ...c, [field]: !c[field] } : c));
  };

  // 10. Vault
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [vaultLogs, setVaultLogs] = useState<string[]>([]);
  const vaultCredentials = [
    { id: 'vc-1', name: 'Instagram Publisher API Key', secret: 'insta_api_key_8841', dept: 'Marketing' },
    { id: 'vc-2', name: 'Company Bank account Ledger', secret: 'cash_vault_ledger_330', dept: 'Finance' }
  ];
  const handleToggleReveal = (credId: string, name: string) => {
    if (revealedIds.includes(credId)) {
      setRevealedIds(prev => prev.filter(id => id !== credId));
    } else {
      setRevealedIds(prev => [...prev, credId]);
      setVaultLogs(prev => [`[${new Date().toLocaleTimeString()}] REVEALED: ${name} password`, ...prev]);
    }
  };

  // 11. Admin
  const [customFields, setCustomFields] = useState([{ label: 'Slack Username', type: 'Text' }]);
  const [newFieldName, setNewFieldName] = useState('');
  const handleAddFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    setCustomFields(prev => [...prev, { label: newFieldName, type: 'Text' }]);
    setNewFieldName('');
  };

  // 12. Touchpoints
  const [touchChat, setTouchChat] = useState<string[]>([]);
  const [touchInput, setTouchInput] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const handleTouchChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!touchInput.trim()) return;
    setTouchChat(prev => [...prev, `Client: ${touchInput}`]);
    setTouchInput('');
    setTimeout(() => {
      setTouchChat(prev => [...prev, "Agent: Thanks! We are reviewing your Company OS deployment layout request."]);
    }, 500);
  };
  const handleBookSlot = (slot: string) => {
    if (bookedSlots.includes(slot)) {
      setBookedSlots(prev => prev.filter(s => s !== slot));
    } else {
      setBookedSlots(prev => [...prev, slot]);
    }
  };

  // 13. Marketing
  const [dnsVerified, setDnsVerified] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState('New Product Launch Alert');
  const [campaignLogs, setCampaignLogs] = useState<string[]>([]);
  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dnsVerified) {
      alert('Verify DNS TXT flags prior to launching campaign!');
      return;
    }
    setCampaignLogs(prev => [`[${new Date().toLocaleTimeString()}] SENT: "${campaignSubject}" to 1,500 clients.`, ...prev]);
  };

  // 14. Growth
  const [socialText, setSocialText] = useState('We are launching Company OS today! Check out the details.');
  const [activePlatformPreview, setActivePlatformPreview] = useState<'x' | 'linkedin'>('x');
  const [socialQueue, setSocialQueue] = useState<string[]>([]);
  const handlePublishSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialText.trim()) return;
    setSocialQueue(prev => [`Scheduled: "${socialText}"`, ...prev]);
    setSocialText('');
  };

  // 15. Media (e-Signatures)
  const [signatureName, setSignatureName] = useState('');
  const [signStamps, setSignStamps] = useState<string[]>([]);
  const [documentSealed, setDocumentSealed] = useState(false);
  const handlePlaceStamp = (type: string) => {
    setSignStamps(prev => [...prev, `${type} stamp placed`]);
  };
  const handleSealDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim() || signStamps.length === 0) return;
    setDocumentSealed(true);
  };

  return (
    <div className="bg-[#090A09] text-[#E5E7E6] min-h-screen selection:bg-[#E1FF4B] selection:text-black font-sans pb-24">
      
      {/* FULL-BLEED TYPOGRAPHIC HERO & HEADER SECTION */}
      <div className="w-full bg-gradient-to-tr from-[#0D0B18] via-[#2E1065] to-[#5821A6] border-b border-[#3B1B72]/30 pb-20 relative overflow-hidden">
        {/* Navigation Header */}
        <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-white/10 z-10 relative">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#E1FF4B] rounded-xl flex items-center justify-center text-black font-black text-xs shadow-[0_0_15px_rgba(225,255,75,0.25)]">
              OS
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-sm tracking-wider uppercase text-white block">Company OS</span>
              <span className="text-[7px] text-[#A2A6A2] font-mono tracking-widest uppercase flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3CD070] animate-pulse"></span> Node Active // en-US
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-wider text-[#A2A6A2] font-mono">
            <a href="#tour" className="hover:text-white transition-colors">Tour</a>
            <a href="#math" className="hover:text-white transition-colors">SaaS Audit</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#features" className="hover:text-[#E1FF4B] transition-colors flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#E1FF4B]" /> Directory
            </a>
          </nav>
          <Link 
            href="/"
            className="px-4 py-2 border border-[#E1FF4B]/30 hover:border-[#E1FF4B] hover:bg-[#E1FF4B]/5 text-[#E1FF4B] text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition-all font-mono"
          >
            Launch Intranet Demo
          </Link>
        </header>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 flex flex-col justify-between min-h-[460px] lg:min-h-[500px] relative z-10 text-left">
          {/* Top Row: System Specs */}
          <div className="flex justify-between items-center text-[9px] font-mono text-white/40 uppercase tracking-widest border-b border-white/5 pb-4 w-full">
            <span>System Node // 0xCC</span>
            <span className="hidden sm:inline">Lifetime License // On-Premises</span>
            <span>R-2026</span>
          </div>

          {/* Center: Massive Bold Text Headline */}
          <div className="space-y-6 md:space-y-8 my-auto pt-10 pb-10 text-left">
            <h1 className="font-serif italic font-black text-4xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-[0.9] max-w-5xl">
              Stop Renting Your Business Register. <span className="text-[#E1FF4B] underline decoration-[#E1FF4B]/30 underline-offset-8">Own Your Software.</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-white/80 font-medium max-w-2xl leading-relaxed">
              Run your entire operation—Sales CRM, Helpdesks, HR files, wikis, and credentials—on a secure server database. Lifetime licensing with zero monthly seat taxes.
            </p>
          </div>

          {/* Bottom Row: Social references & CTAs */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-6 border-t border-white/5 pt-6 w-full">
            <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest flex gap-6 items-center">
              <span className="hover:text-white transition-colors cursor-pointer">BEHANCE</span>
              <span>•</span>
              <span className="hover:text-white transition-colors cursor-pointer">INSTAGRAM</span>
              <span>•</span>
              <span className="hover:text-white transition-colors cursor-pointer">LINKEDIN</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="#tour"
                className="px-8 py-3 bg-[#E1FF4B] hover:bg-[#C0D930] text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_25px_rgba(225,255,75,0.25)] flex items-center justify-center gap-2 group text-center"
              >
                Launch Interactive Tour <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="#math"
                className="px-8 py-3 bg-transparent border border-white/20 hover:border-white/45 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center text-center"
              >
                See Consolidation Math
              </a>
            </div>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-tr from-purple-500/15 to-pink-500/5 rounded-full blur-[140px] -z-10 animate-pulse"></div>
      </div>

      {/* LIVE INTERACTIVE PRODUCT TOUR SECTION */}
      <section id="tour" className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-extrabold text-[#E1FF4B] uppercase tracking-widest font-mono">See Inside the OS</span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            Live Interactive Product Tour
          </h2>
          <p className="text-xs md:text-sm text-[#A2A6A2] font-semibold leading-relaxed">
            Click any of the 15 suites in the sidebar of our interactive console below to inspect the actual dashboard layouts, tools, and workflows.
          </p>
        </div>

        {/* Browser Mockup Window */}
        <div className="bg-[#121412] border border-[#1A1C19] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row min-h-[580px]">
          
          {/* Neon browser dots and tabs bar */}
          <div className="absolute top-4 left-6 flex items-center gap-1.5 z-20">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF3E3E]"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#3CD070]"></span>
            <span className="text-[8px] font-mono text-[#5E6258] ml-4 mr-6">company-os://client-node/dashboard</span>
            <span className="hidden lg:inline-flex items-center gap-2 text-[7.5px] font-mono text-[#A2A6A2]/60 uppercase tracking-wider bg-white/5 border border-white/5 px-2 py-0.5 rounded">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3CD070] animate-pulse"></span>
              Latency: {telemetry.dbLatency}ms • CPU: {telemetry.cpuLoad}% • Nodes: {telemetry.nodes}
            </span>
          </div>

          {/* Left: Custom Sidebar (mimics app sidebar) */}
          <div className="w-full md:w-56 bg-[#090A09] border-r border-[#1A1C19] pt-14 pb-6 px-3 flex flex-col justify-between shrink-0">
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase tracking-wider text-[#5E6258] px-3 block mb-2 font-mono">Suites Index</span>
              
              <div className="space-y-1 max-h-[260px] lg:max-h-[300px] overflow-y-auto pr-1">
                {TOUR_SUITES.map(suite => {
                  const Icon = suite.icon;
                  const isActive = activeTourSuite === suite.id;
                  return (
                    <button
                      key={suite.id}
                      onClick={() => setActiveTourSuite(suite.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                        isActive 
                          ? 'bg-white/5 text-[#E1FF4B] border border-[#1A1C19]' 
                          : 'text-[#A2A6A2] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#E1FF4B]' : 'text-[#5E6258]'}`} />
                      <span className="truncate">{suite.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Telemetry and Specs footer block */}
            <div className="pt-4 border-t border-[#1A1C19]/60 px-3 space-y-4">
              <div>
                <Link 
                  href={`/landing/features/${activeTourSuite}`}
                  className="text-[9px] font-extrabold uppercase text-[#E1FF4B] hover:text-white flex items-center gap-1 transition-all font-mono"
                >
                  In-Depth Spec Page <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Monospace telemetry monitor */}
              <div className="bg-[#121412] border border-[#1A1C19] p-3 rounded-2xl space-y-2">
                <span className="text-[7px] text-[#5E6258] uppercase font-mono font-bold block border-b border-[#1A1C19] pb-1">Vitals Monitor</span>
                <div className="grid grid-cols-2 gap-1.5 text-white text-[8px] font-mono">
                  <div>
                    <span className="text-[#5E6258] block">Latency</span>
                    <span className="text-[#E1FF4B]">{telemetry.dbLatency}ms</span>
                  </div>
                  <div>
                    <span className="text-[#5E6258] block">Active</span>
                    <span className="text-purple-400">{telemetry.nodes} nodes</span>
                  </div>
                </div>
                {/* Micro Log stream */}
                <div className="bg-[#090A09] border border-[#1A1C19]/80 rounded p-1.5 font-mono text-[6px] text-[#A2A6A2] leading-tight select-none truncate">
                  {logsList[0] || 'System Idle'}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Simulated App Panel View */}
          <div className="flex-1 bg-[#121412] p-8 pt-14 flex flex-col justify-between text-xs overflow-y-auto max-h-[580px]">
            
            {/* Header info */}
            <div className="flex justify-between items-center border-b border-[#1A1C19] pb-3 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase text-white">
                  {TOUR_SUITES.find(s => s.id === activeTourSuite)?.name} Dashboard
                </span>
                <span className="text-[8px] font-bold text-red-400 block uppercase mt-0.5 font-mono">
                  Replaces: {TOUR_SUITES.find(s => s.id === activeTourSuite)?.replaces}
                </span>
              </div>
              <span className="text-[8px] font-black bg-[#E1FF4B]/10 border border-[#E1FF4B]/20 text-[#E1FF4B] px-2 py-0.5 rounded uppercase font-mono">
                Active preview
              </span>
            </div>

            {/* Simulated UI Screens */}
            <div className="flex-1 flex flex-col justify-center min-h-[300px]">
              
              {/* SALES CRM SCREEN */}
              {activeTourSuite === 'sales' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[9px] font-mono uppercase text-[#A2A6A2] mb-2">
                    <span>Deal Roster Board</span>
                    <span className="text-white font-mono">Expected Pipeline Total: ${salesDeals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.cost, 0).toLocaleString('en-US')}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    {['leads', 'proposal', 'won'].map(stage => (
                      <div key={stage} className="bg-[#090A09]/80 border border-[#1A1C19] p-3 rounded-2xl space-y-2.5">
                        <span className="text-[8px] font-black uppercase text-[#5E6258] block mb-1 font-mono">{stage}</span>
                        
                        {salesDeals.filter(d => d.stage === stage).map(d => (
                          <div key={d.id} className="bg-[#121412] border border-[#1A1C19] p-2.5 rounded-xl text-[9px] space-y-2">
                            <div>
                              <span className="font-extrabold text-white block truncate">{d.title}</span>
                              <span className="text-[8px] text-[#A2A6A2] font-semibold font-mono">${d.cost.toLocaleString('en-US')}</span>
                            </div>
                            <div className="flex gap-1.5 justify-end">
                              {stage === 'leads' && <button onClick={() => handleMoveDeal(d.id, 'proposal')} className="px-1.5 py-0.5 bg-[#E1FF4B] text-black text-[7px] font-black uppercase rounded">Move</button>}
                              {stage === 'proposal' && <button onClick={() => handleMoveDeal(d.id, 'won')} className="px-1.5 py-0.5 bg-[#E1FF4B] text-black text-[7px] font-black uppercase rounded">Won</button>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HR OPERATIONS SCREEN */}
              {activeTourSuite === 'hr' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 p-4 bg-[#090A09]/80 border border-[#1A1C19] rounded-2xl">
                      <span className="text-[8px] font-black text-[#5E6258] uppercase block font-mono">Geofenced Check-In Panel</span>
                      
                      {gpsLocation ? (
                        <p className="text-white font-extrabold flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#E1FF4B]" /> SF Office (12.9716, 77.5946)</p>
                      ) : (
                        <button onClick={handleGpsVerify} className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-bold uppercase rounded-lg border border-[#1A1C19] text-[9px] font-mono">Verify Browser GPS</button>
                      )}

                      {punchStatus === 'online' ? (
                        <div className="space-y-2.5">
                          <input type="text" value={handoverNotes} onChange={(e) => setHandoverNotes(e.target.value)} placeholder="Type mandatory notes..." className="w-full bg-[#121412] border border-[#1A1C19] rounded-lg px-2 py-1.5 text-xs text-white" />
                          <button onClick={() => handleClockToggle('out')} className="w-full py-2 bg-[#FF3E3E] text-white font-bold uppercase rounded-xl text-[9px]">Clock Out</button>
                        </div>
                      ) : (
                        <button onClick={() => handleClockToggle('in')} disabled={!gpsLocation} className="w-full py-2 bg-[#E1FF4B] text-black font-black uppercase rounded-xl disabled:bg-[#E1FF4B]/50 text-[9px]">Clock In</button>
                      )}
                    </div>

                    <div className="bg-[#090A09]/80 border border-[#1A1C19] p-4 rounded-2xl flex flex-col justify-between max-h-[180px] overflow-y-auto">
                      <span className="text-[8px] font-black text-[#5E6258] uppercase block mb-1 font-mono">Roster Logs</span>
                      {punchLogs.map((l, i) => (
                        <div key={i} className="font-mono text-[8px] text-[#A2A6A2] leading-tight border-b border-[#1A1C19]/40 pb-1">{l}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* IT SERVICE DESK SCREEN */}
              {activeTourSuite === 'it' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
                  <div className="md:col-span-5 space-y-1.5">
                    <span className="text-[8px] font-black text-[#5E6258] uppercase block font-mono">Ticket Queue</span>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto">
                      {ticketsList.map(t => (
                        <div key={t.id} onClick={() => setActiveTicket(t.id)} className={`p-2.5 rounded-xl border cursor-pointer transition-all ${activeTicket === t.id ? 'bg-white/5 border-[#E1FF4B]' : 'bg-[#090A09]/80 border-[#1A1C19]'}`}>
                          <div className="flex justify-between items-center text-[7px] font-black uppercase mb-1 font-mono"><span>{t.id}</span><span className="text-red-400">{t.priority}</span></div>
                          <h4 className="text-[9px] font-black text-white truncate">{t.title}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-7 flex flex-col justify-between border-l border-[#1A1C19]/60 pl-4">
                    <div className="space-y-2 flex-1">
                      <span className="text-[9px] font-bold text-white uppercase block border-b border-[#1A1C19] pb-1.5 mb-2 font-mono">Chat Resolution</span>
                      <div className="space-y-2 max-h-[100px] overflow-y-auto text-[#A2A6A2] font-semibold text-[9px]">
                        {ticketsList.find(t => t.id === activeTicket)?.messages.map((m, idx) => (
                          <div key={idx} className={`p-1.5 rounded-lg ${m.startsWith('Staff') ? 'bg-[#E1FF4B]/5 border border-[#E1FF4B]/10 text-white' : 'bg-[#090A09]/80 border-[#1A1C19]'}`}>{m}</div>
                        ))}
                      </div>
                    </div>
                    <form onSubmit={handleSendReply} className="flex gap-2 mt-2 pt-2 border-t border-[#1A1C19]">
                      <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type reply..." className="flex-1 bg-[#090A09]/80 border border-[#1A1C19] rounded px-2 py-1 text-white focus:outline-none" />
                      <button type="submit" className="px-3 bg-[#E1FF4B] text-black font-extrabold rounded uppercase text-[9px] font-mono">Send</button>
                    </form>
                  </div>
                </div>
              )}

              {/* FINANCIAL LEDGER SCREEN */}
              {activeTourSuite === 'finance' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <span className="text-[8px] font-black text-[#5E6258] uppercase block font-mono">Vendor SaaS Subscriptions (100 Users)</span>
                  <div className="space-y-2">
                    {activeVendors.map(vendor => (
                      <div key={vendor.id} className={`flex justify-between items-center bg-[#090A09]/80 border p-3.5 rounded-xl ${vendor.active ? 'border-[#1A1C19]' : 'border-[#1A1C19]/30 opacity-40'}`}>
                        <div>
                          <span className="font-extrabold text-white block">{vendor.name}</span>
                          <span className="text-[8px] text-[#5E6258] font-mono">Active Roster License</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-[#E1FF4B] font-bold font-mono">${vendor.cost.toLocaleString('en-US')}/mo</span>
                          <button onClick={() => handleToggleVendor(vendor.id)} className="px-2 py-0.5 bg-white/5 border border-[#1A1C19] rounded text-[8px] uppercase font-mono">{vendor.active ? 'Disable' : 'Enable'}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ASYNC COMMS SCREEN */}
              {activeTourSuite === 'comms' && (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div className="bg-[#090A09]/80 border border-[#1A1C19] p-3.5 rounded-2xl flex flex-col justify-between">
                      <span className="text-[8px] font-black text-[#5E6258] uppercase block mb-1 font-mono">Live SOP Manual Editor</span>
                      <textarea value={wikiMarkdown} onChange={(e) => setWikiMarkdown(e.target.value)} className="w-full bg-[#121412] border border-[#1A1C19] rounded-lg p-1.5 text-white resize-none font-mono text-[9px]" rows={6} />
                    </div>
                    <div className="bg-[#090A09]/80 border border-[#1A1C19] p-3.5 rounded-2xl flex flex-col justify-between">
                      <span className="text-[8px] font-black text-[#5E6258] uppercase block mb-1 font-mono">Cliq chat</span>
                      <div className="flex-1 overflow-y-auto max-h-[100px] text-[9px] text-[#A2A6A2] font-semibold space-y-1 mb-2">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className="border-b border-[#1A1C19]/40 pb-1">{msg}</div>
                        ))}
                      </div>
                      <form onSubmit={handleChatSubmit} className="flex gap-2">
                        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type msg..." className="flex-1 bg-[#121412] border border-[#1A1C19] rounded px-2 py-1 text-white focus:outline-none" />
                        <button type="submit" className="px-2.5 bg-[#E1FF4B] text-black font-extrabold rounded uppercase text-[8px] font-mono">Send</button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* PROJECTS SCREEN */}
              {activeTourSuite === 'project' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <span className="text-[8px] font-black text-[#5E6258] uppercase block font-mono">Agile Kanban Workspace</span>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    {['todo', 'inprogress'].map(stage => (
                      <div key={stage} className="bg-[#090A09]/80 border border-[#1A1C19] p-3.5 rounded-2xl space-y-2">
                        <span className="text-[8px] font-black uppercase text-[#5E6258] block border-b border-[#1A1C19] pb-1 mb-1 font-mono">{stage === 'todo' ? 'To Do' : 'In Progress'}</span>
                        {projectTasks.filter(t => t.stage === stage).map(t => (
                          <div key={t.id} className="bg-[#121412] border border-[#1A1C19] p-2 rounded-xl flex justify-between items-center text-[9px]">
                            <span className="font-extrabold text-white truncate mr-1">{t.title}</span>
                            {stage === 'todo' ? (
                              <button onClick={() => handleMoveTask(t.id, 'inprogress')} className="px-1.5 py-0.5 bg-[#E1FF4B] text-black text-[7px] font-black uppercase rounded shrink-0">Start</button>
                            ) : (
                              <button onClick={() => handleMoveTask(t.id, 'todo')} className="px-1.5 py-0.5 bg-[#FF3E3E] text-white text-[7px] font-black uppercase rounded shrink-0">Stop</button>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PERFORMANCE OKRS */}
              {activeTourSuite === 'performance' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <span className="text-[8px] font-black text-[#5E6258] uppercase block font-mono">Company OKRs &amp; Goals</span>
                  <div className="space-y-3 p-4 bg-[#090A09]/80 border border-[#1A1C19] rounded-2xl">
                    {companyGoals.map(goal => (
                      <div key={goal.title} className="space-y-1">
                        <div className="flex justify-between font-bold text-[9px]"><span>{goal.title}:</span><span className="text-[#E1FF4B] font-mono">{goal.progress}%</span></div>
                        <div className="h-1.5 bg-[#121412] rounded-full overflow-hidden"><div className="bg-[#E1FF4B] h-full" style={{ width: `${goal.progress}%` }}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FACILITY BOOKING */}
              {activeTourSuite === 'facility' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[8px] font-black text-[#5E6258] uppercase block mb-1 font-mono font-mono">Click desk to Book (Desk Hoteling Map)</span>
                    <div className="grid grid-cols-4 gap-2 text-center text-[9px]">
                      {['Desk 1', 'Desk 2', 'Desk 3', 'Desk 4', 'Desk 5', 'Desk 6'].map(desk => {
                        const isBooked = bookedDesks.includes(desk);
                        return (
                          <div key={desk} onClick={() => handleDeskToggle(desk)} className={`p-2 rounded-xl border cursor-pointer font-bold transition-all ${isBooked ? 'bg-red-400/10 border-red-400 text-red-400' : 'bg-[#090A09]/80 border-[#1A1C19] text-white hover:border-[#E1FF4B]'}`}>
                            {desk}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <form onSubmit={handleRoomSubmit} className="flex gap-2 border-t border-[#1A1C19] pt-3">
                    <select value={newRoomTime} onChange={(e) => setNewRoomTime(e.target.value)} className="bg-[#090A09]/80 text-xs border border-[#1A1C19] text-white rounded-lg p-1.5 flex-1 font-mono">
                      <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                      <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                    </select>
                    <button type="submit" className="px-4 bg-[#E1FF4B] text-black font-extrabold rounded uppercase text-[9px] font-mono">Book Room</button>
                  </form>
                </div>
              )}

              {/* ONBOARDING PIPELINES */}
              {activeTourSuite === 'onboarding' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {hiredCandidates.map(cand => (
                      <div key={cand.id} className="bg-[#090A09]/80 border border-[#1A1C19] p-3 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-white block">{cand.name}</span>
                          <span className="text-[7px] bg-green-500/10 border border-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase font-black font-mono">{cand.status}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => toggleOnboardStep(cand.id, 'itCheck')} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border font-mono ${cand.itCheck ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-transparent border-[#1A1C19] text-[#A2A6A2]'}`}>IT hardware Check</button>
                          <button onClick={() => toggleOnboardStep(cand.id, 'wikiRead')} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border font-mono ${cand.wikiRead ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-transparent border-[#1A1C19] text-[#A2A6A2]'}`}>Wiki SOP read</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECURE VAULT */}
              {activeTourSuite === 'vault' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {vaultCredentials.map(cred => {
                      const isRevealed = revealedIds.includes(cred.id);
                      return (
                        <div key={cred.id} className="flex justify-between items-center bg-[#090A09]/80 border border-[#1A1C19] rounded-xl p-3.5">
                          <div>
                            <span className="font-extrabold text-white block">{cred.name}</span>
                            <span className="text-[8px] font-bold text-[#5E6258] uppercase font-mono">Dept lock: {cred.dept}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="font-mono text-[#E1FF4B] bg-[#121412] px-2 py-1 rounded border border-[#1A1C19]">
                              {isRevealed ? cred.secret : '••••••••••••'}
                            </span>
                            <button onClick={() => handleToggleReveal(cred.id, cred.name)} className="p-1 bg-white/5 border border-[#1A1C19] rounded text-[#A2A6A2] hover:text-white"><Eye className="h-3 w-3" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COMMAND CENTER */}
              {activeTourSuite === 'admin' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <span className="text-[8px] font-black text-[#5E6258] uppercase block font-mono">Admin profile fields injector</span>
                  <div className="space-y-2">
                    {customFields.map(f => (
                      <div key={f.label} className="flex justify-between items-center text-[9px] bg-[#090A09]/80 border border-[#1A1C19] p-2 rounded-lg">
                        <span className="font-extrabold text-white">{f.label}</span>
                        <span className="text-[#5E6258] font-bold uppercase font-mono">{f.type}</span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleAddFieldSubmit} className="flex gap-2 border-t border-[#1A1C19] pt-3">
                    <input type="text" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} placeholder="New Profile Field..." required className="flex-1 bg-[#090A09]/80 border border-[#1A1C19] rounded-lg px-2 py-1 text-white focus:outline-none" />
                    <button type="submit" className="px-4 bg-[#E1FF4B] text-black font-extrabold rounded uppercase text-[9px] font-mono">Inject</button>
                  </form>
                </div>
              )}

              {/* CUSTOMER TOUCHPOINTS */}
              {activeTourSuite === 'touchpoints' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
                  <div className="md:col-span-6 space-y-2 flex flex-col justify-between">
                    <span className="text-[8px] font-black text-[#5E6258] uppercase block font-mono">Customer Live Support Chat</span>
                    <div className="flex-1 bg-[#090A09]/80 border border-[#1A1C19] rounded-xl p-3 overflow-y-auto max-h-[120px] text-[9px] font-semibold space-y-1">
                      {touchChat.map((m, i) => (
                        <div key={i} className={`p-1 rounded ${m.startsWith('Client') ? 'text-right text-white' : 'text-[#E1FF4B]'}`}>{m}</div>
                      ))}
                    </div>
                    <form onSubmit={handleTouchChat} className="flex gap-2">
                      <input type="text" value={touchInput} onChange={(e) => setTouchInput(e.target.value)} placeholder="Ask support a question..." className="flex-1 bg-[#090A09]/80 border border-[#1A1C19] rounded px-2 py-1 text-white focus:outline-none" />
                      <button type="submit" className="px-2.5 bg-[#E1FF4B] text-black font-extrabold rounded uppercase text-[8px] font-mono">Send</button>
                    </form>
                  </div>
                  <div className="md:col-span-6 border-l border-[#1A1C19]/60 pl-4 space-y-2 flex flex-col justify-between">
                    <span className="text-[8px] font-black text-[#5E6258] uppercase block font-mono font-mono">Schedule Client Call</span>
                    <div className="grid grid-cols-2 gap-2 text-center text-[9px]">
                      {['10:00 AM', '11:30 AM', '02:00 PM'].map(s => {
                        const isB = bookedSlots.includes(s);
                        return <div key={s} onClick={() => handleBookSlot(s)} className={`p-2 rounded border cursor-pointer font-bold ${isB ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-[#090A09]/80 border-[#1A1C19] text-white hover:border-[#E1FF4B]'}`}>{s}</div>;
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* MARKETING HUB SCREEN */}
              {activeTourSuite === 'marketing' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <form onSubmit={handleLaunchCampaign} className="space-y-3 bg-[#090A09]/80 border border-[#1A1C19] p-4 rounded-xl">
                      <input type="text" value={campaignSubject} onChange={(e) => setCampaignSubject(e.target.value)} className="w-full bg-[#121412] border border-[#1A1C19] rounded p-1 text-white" />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setDnsVerified(true)} className={`flex-1 py-1 rounded text-[8px] font-black uppercase border font-mono ${dnsVerified ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-white/5 border-[#1A1C19]'}`}>Verify DNS</button>
                        <button type="submit" className="px-3 bg-[#E1FF4B] text-black font-extrabold rounded uppercase text-[9px] font-mono font-mono font-mono">Launch</button>
                      </div>
                    </form>
                    <div className="bg-[#090A09]/80 border border-[#1A1C19] p-4 rounded-xl flex flex-col justify-between max-h-[160px] overflow-y-auto">
                      <span className="text-[8px] font-black text-[#5E6258] uppercase block mb-1 font-mono">Campaign Logs</span>
                      {campaignLogs.map((log, i) => <div key={i} className="font-mono text-[8px] text-[#A2A6A2] border-b border-[#1A1C19]/40 pb-1 mt-1">{log}</div>)}
                    </div>
                  </div>
                </div>
              )}

              {/* GROWTH SUITE SCREEN */}
              {activeTourSuite === 'growth' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4">
                    <form onSubmit={handlePublishSocial} className="space-y-2">
                      <textarea value={socialText} onChange={(e) => setSocialText(e.target.value)} rows={3} className="w-full bg-[#090A09]/80 border border-[#1A1C19] rounded p-1.5 text-white resize-none" />
                      <button type="submit" className="w-full py-1.5 bg-[#E1FF4B] text-black font-extrabold uppercase rounded text-[8px] font-mono">Schedule post</button>
                    </form>
                    <div className="bg-[#090A09]/80 border border-[#1A1C19] p-3 rounded-xl text-[9px]">
                      <span className="text-[7px] font-black uppercase text-[#5E6258] block mb-1 font-mono">X mockup preview</span>
                      <p className="italic text-[#A2A6A2]">"{socialText || '...'}"</p>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCUMENTS & MEDIA SCREEN */}
              {activeTourSuite === 'media' && (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="bg-[#090A09]/80 border border-[#1A1C19] p-4 rounded-2xl space-y-2.5">
                    <span className="text-[8px] uppercase tracking-wider text-[#5E6258] font-bold block font-mono">Digital Contract Canvas</span>
                    <p className="text-[10px] text-white font-extrabold">"I agree to deploy Company OS with a setup fee of $9,500."</p>
                    
                    <div className="flex gap-2">
                      <button onClick={() => handlePlaceStamp('Signature')} className="px-2 py-0.5 bg-white/5 border border-[#1A1C19] rounded hover:border-[#E1FF4B] text-[8px] uppercase font-black text-[#A2A6A2] font-mono">Place Signature</button>
                      <button onClick={() => handlePlaceStamp('Date')} className="px-2 py-0.5 bg-white/5 border border-[#1A1C19] rounded hover:border-[#E1FF4B] text-[8px] uppercase font-black text-[#A2A6A2] font-mono">Place Date</button>
                    </div>

                    <div className="flex gap-1.5 text-[9px] font-mono text-[#E1FF4B]">
                      {signStamps.map((s, idx) => (
                        <div key={idx} className="bg-[#121412] px-2 py-0.5 rounded border border-[#1A1C19]">{s}</div>
                      ))}
                    </div>

                    {documentSealed && (
                      <div className="p-2 bg-[#3CD070]/10 border border-[#3CD070]/30 rounded text-[9px] font-mono text-[#3CD070]">
                        Sealed successfully!
                      </div>
                    )}
                  </div>

                  {!documentSealed && (
                    <form onSubmit={handleSealDocument} className="flex gap-2 border-t border-[#1A1C19] pt-2">
                      <input type="text" value={signatureName} onChange={(e) => setSignatureName(e.target.value)} placeholder="Signee..." className="flex-1 bg-[#090A09]/80 border border-[#1A1C19] rounded px-2 py-1 text-white focus:outline-none" />
                      <button type="submit" className="px-3 bg-[#E1FF4B] text-black font-extrabold rounded uppercase text-[9px] font-mono">Seal &amp; Sign</button>
                    </form>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* CONSOLIDATION MATH SECTION */}
      <section id="math" className="max-w-7xl mx-auto px-6 py-20 border-t border-[#1A1C19] space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] font-extrabold text-[#E1FF4B] uppercase tracking-widest font-mono">The Financial Trap</span>
            <h2 className="text-3xl font-black tracking-tight text-white leading-none">
              Are you paying $3,400+ every month for employee admin?
            </h2>
            <p className="text-xs text-[#A2A6A2] leading-relaxed">
              Standard SaaS models charge per-user, per-month subscriptions for basic operational utilities. As your employee roster scales, your monthly seat tax explodes.
            </p>
            <p className="text-xs text-[#A2A6A2] leading-relaxed">
              <strong>Company OS</strong> cuts this loop. We package your custom administrative platform and host it directly in your Neon/Vercel namespaces. No middleman markup.
            </p>

            <div className="p-5 bg-[#121412] border border-[#1A1C19] rounded-2xl space-y-2.5">
              <div className="flex justify-between items-center text-xs text-[#A2A6A2]">
                <span>Annual SaaS Roster:</span>
                <span className="line-through text-red-400 font-bold font-mono">${saasAnnualTotal.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-white font-extrabold border-t border-[#1A1C19] pt-2.5">
                <span>Company OS Setup:</span>
                <span className="text-[#E1FF4B] font-mono">${(9500).toLocaleString('en-US')} (One-Time)</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#3CD070] font-black border-t border-[#1A1C19] pt-2.5 bg-[#3CD070]/5 p-2 rounded-xl">
                <span>Year 1 Net Savings:</span>
                <span className="font-mono">${(saasAnnualTotal - 9500 - 999).toLocaleString('en-US')}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#121412] border border-[#1A1C19] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-[#1A1C19] pb-4 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white font-mono">Monthly Subscription Audit (100 Users)</span>
              <span className="text-xs font-bold text-red-400 flex items-center gap-1 font-mono"><TrendingDown className="h-4 w-4" /> SaaS Overhead</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-[#A2A6A2]">
                <thead>
                  <tr className="border-b border-[#1A1C19] text-[9px] uppercase tracking-wider text-[#5E6258] font-bold font-mono">
                    <th className="py-2.5 px-3">SaaS Service</th>
                    <th className="py-2.5 px-3">Purpose</th>
                    <th className="py-2.5 px-3 text-right">Monthly Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1C19]/40">
                  {SAAS_COMPARSION.map((item) => (
                    <tr key={item.tool} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 text-white font-extrabold">{item.tool}</td>
                      <td className="py-3 px-3">{item.purpose}</td>
                      <td className="py-3 px-3 text-right text-red-400 font-bold font-mono">${item.monthly.toLocaleString('en-US')}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#FF3E3E]/5 font-black text-white">
                    <td className="py-3.5 px-3 rounded-l-xl">Total Overhead</td>
                    <td className="py-3.5 px-3">Rented Services</td>
                    <td className="py-3.5 px-3 text-right text-red-400 rounded-r-xl font-bold font-mono">${saasMonthlyTotal.toLocaleString('en-US')}/mo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* HOSTING & VALUE DETAILS SECTION */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 border-t border-[#1A1C19] grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-left">
          <span className="text-[10px] font-extrabold text-[#E1FF4B] uppercase tracking-widest font-mono">Infrastructure Control</span>
          <h2 className="text-3xl font-black tracking-tight text-white leading-tight">
            Raw Cloud Hosting. Zero Middleman Markups.
          </h2>
          <p className="text-xs text-[#A2A6A2] leading-relaxed">
            Unlike closed platforms that markup database connections and web server capacities, Company OS deploys directly to your infrastructure namespaces.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-xs font-semibold">
              <div className="p-1.5 bg-[#E1FF4B]/10 rounded-lg text-[#E1FF4B] mt-0.5"><Check className="h-4 w-4" /></div>
              <span><strong>Neon DB &amp; Vercel Serverless:</strong> Massive free tiers. Normal transaction volumes run at <strong>$0/month</strong> for hosting.</span>
            </div>
            <div className="flex items-start gap-3 text-xs font-semibold">
              <div className="p-1.5 bg-[#E1FF4B]/10 rounded-lg text-[#E1FF4B] mt-0.5"><Check className="h-4 w-4" /></div>
              <span><strong>Total Control:</strong> Own your code repository. Migrate servers or database clusters without locking contracts.</span>
            </div>
          </div>
        </div>

        <div className="bg-[#121412] border border-[#1A1C19] rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 bg-[#E1FF4B] text-black text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl font-mono">
            One-Time License
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-white">Platform Setup &amp; License</h3>
            <p className="text-xs text-[#5E6258] font-bold uppercase mt-1 font-mono">Full Source-Code Rights</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white font-mono">$9,500</span>
            <span className="text-xs text-[#A2A6A2] font-semibold">flat upfront</span>
          </div>

          <div className="h-[1px] bg-[#1A1C19]" />

          <ul className="space-y-2.5 text-xs text-[#A2A6A2] font-semibold">
            <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#E1FF4B] shrink-0" /> Full source code handover</li>
            <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#E1FF4B] shrink-0" /> Direct deployment setup assistance</li>
            <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#E1FF4B] shrink-0" /> Lifetime usage, zero monthly seat fees</li>
            <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#E1FF4B] shrink-0" /> $999/yr optional upkeep (SSL, back-ups, support)</li>
          </ul>

          <div className="pt-4">
            <Link 
              href="/"
              className="w-full py-3 bg-[#E1FF4B] hover:bg-[#C0D930] text-black text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md block font-mono"
            >
              Test Live Intranet Node
            </Link>
          </div>
        </div>
      </section>

      {/* COMPACT CATEGORIZED FEATURES INDEX */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-[#1A1C19] space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-extrabold text-[#E1FF4B] uppercase tracking-widest font-mono">Product Catalog</span>
          <h2 className="text-3xl font-black tracking-tight text-white leading-tight">
            Comprehensive Suite Directory
          </h2>
          <p className="text-xs text-[#A2A6A2] font-semibold leading-relaxed">
            A modular directory of all 15 active systems included in the Company OS lifetime license, ready to deploy.
          </p>
        </div>

        <div className="space-y-12">
          {CATEGORIZED_FEATURES.map((cat) => (
            <div key={cat.category} className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#E1FF4B] border-b border-[#1A1C19] pb-3">
                {cat.category}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {cat.items.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <Link
                      key={feat.id}
                      href={`/landing/features/${feat.id}`}
                      className="flex flex-col p-4 bg-[#121412] hover:bg-[#161816] border border-[#1A1C19] hover:border-[#E1FF4B]/30 rounded-2xl transition-all duration-200 group hover:-translate-y-1 text-center items-center justify-center min-h-[145px]"
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${feat.gradient} text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-200 mb-3`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="space-y-1 w-full">
                        <h4 className="text-[11px] font-black text-white group-hover:text-[#E1FF4B] transition-colors line-clamp-1">
                          {feat.name}
                        </h4>
                        <p className="text-[9px] text-[#A2A6A2] font-medium leading-tight line-clamp-1">
                          {feat.shortDesc}
                        </p>
                        <p className="text-[8px] text-[#5E6258] font-bold uppercase tracking-wider font-mono mt-0.5">
                          Replaces {feat.replaces}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 pt-20 border-t border-[#1A1C19] text-center space-y-6">
        <p className="text-xs text-[#5E6258] font-bold uppercase tracking-wider font-mono">© 2026 Company OS Intranet Suite. White-labeled. Self-Hosted.</p>
      </footer>
    </div>
  );
}
