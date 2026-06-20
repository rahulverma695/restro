'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppState } from '@/context/StateContext';
import { SuiteName, UserRole, suitePermissions } from '@/lib/rbac';
import { 
  Users, 
  Wallet, 
  Terminal, 
  MessagesSquare, 
  Sliders,
  FolderTree,
  Activity,
  Layers,
  HelpCircle,
  FileText,
  Settings,
  ShieldAlert,
  Home,
  Briefcase,
  Key,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  PhoneCall,
  Send,
  Globe,
  Video
} from 'lucide-react';

interface SuiteItem {
  id: SuiteName;
  name: string;
  icon: any;
  color: string;
  glow: string;
}

const suites: SuiteItem[] = [
  { id: 'hr', name: 'HR Operations', icon: Users, color: 'text-black', glow: 'hover:bg-white/60' },
  { id: 'it', name: 'IT Service Desk', icon: Terminal, color: 'text-black', glow: 'hover:bg-white/60' },
  { id: 'finance', name: 'Financial Ledger', icon: Wallet, color: 'text-black', glow: 'hover:bg-white/60' },
  { id: 'comms', name: 'Async Comms', icon: MessagesSquare, color: 'text-black', glow: 'hover:bg-white/60' },
  { id: 'project', name: 'Project Management', icon: Layers, color: 'text-black', glow: 'hover:bg-white/60' },
  { id: 'performance', name: 'Performance OKRs', icon: Activity, color: 'text-black', glow: 'hover:bg-white/60' },
  { id: 'facility', name: 'Facility Booking', icon: Calendar, color: 'text-black', glow: 'hover:bg-white/60' },
  { id: 'onboarding', name: 'Onboarding Pipelines', icon: Briefcase, color: 'text-black', glow: 'hover:bg-white/60' },
  { id: 'vault', name: 'Secure Vault', icon: Key, color: 'text-black', glow: 'hover:bg-white/60' },
  { id: 'admin', name: 'Command Center', icon: Settings, color: 'text-black', glow: 'hover:bg-white/60' },
  { id: 'sales', name: 'Sales CRM', icon: TrendingUp, color: 'text-black', glow: 'hover:bg-white/60' },
  { id: 'touchpoints', name: 'Customer Touchpoints', icon: PhoneCall, color: 'text-black', glow: 'hover:bg-white/60' },
  { id: 'marketing', name: 'Marketing Hub', icon: Send, color: 'text-black', glow: 'hover:bg-white/60' },
  { id: 'growth', name: 'Growth Suite', icon: Globe, color: 'text-black', glow: 'hover:bg-white/60' },
  { id: 'media', name: 'Documents & Media', icon: Video, color: 'text-black', glow: 'hover:bg-white/60' },
];

const suiteSubmenu: Record<SuiteName, Array<{ name: string; href: string; icon: any }>> = {
  hr: [
    { name: 'Employee Directory', href: '/hr/directory', icon: FolderTree },
    { name: 'Leave Tracker', href: '/hr/leaves', icon: Activity },
    { name: 'ATS Pipelines', href: '/hr/ats', icon: Layers },
  ],
  it: [
    { name: 'Resolution Desk', href: '/it/helpdesk', icon: HelpCircle },
    { name: 'Shift Handovers', href: '/it/handovers', icon: FileText },
  ],
  finance: [
    { name: 'Expense Claims', href: '/finance/expenses', icon: Wallet },
    { name: 'Vendor SaaS Tracker', href: '/finance/vendors', icon: FileText },
  ],
  comms: [
    { name: 'Company Wiki SOPs', href: '/comms/wiki', icon: FileText },
    { name: 'Bulletin Board', href: '/comms/board', icon: Layers },
    { name: 'Live Team Chat', href: '/comms/chat', icon: MessagesSquare },
  ],
  project: [
    { name: 'Agile Kanban Board', href: '/project/kanban', icon: Layers },
    { name: 'Billable Timers', href: '/project/timers', icon: Activity },
    { name: 'Gantt Dependencies', href: '/project/gantt', icon: FolderTree },
  ],
  performance: [
    { name: 'Goal OKRs Progress', href: '/performance/okrs', icon: Activity },
    { name: '360 Review Ratings', href: '/performance/reviews', icon: FolderTree },
    { name: 'Coaching 1-on-1 Logs', href: '/performance/coaching', icon: FileText },
  ],
  facility: [
    { name: 'Meeting Room Calendar', href: '/facility/rooms', icon: Calendar },
    { name: 'Desk Hoteling Floor', href: '/facility/desks', icon: FolderTree },
  ],
  onboarding: [
    { name: 'Sequential Checklists', href: '/onboarding/checklists', icon: Briefcase },
    { name: 'Training SOP Tracker', href: '/onboarding/training', icon: FileText },
  ],
  vault: [
    { name: 'Credentials Manager', href: '/vault/credentials', icon: Key },
  ],
  admin: [
    { name: 'Profile Fields Gen', href: '/admin/fields', icon: Sliders },
    { name: 'System Audit Logs', href: '/admin/audit', icon: FileText },
    { name: 'Global Hub Settings', href: '/admin/settings', icon: Settings },
  ],
  sales: [
    { name: 'Sales CRM', href: '/sales/crm', icon: FolderTree },
    { name: 'Pipeline Deals', href: '/sales/bigin', icon: Layers },
  ],
  touchpoints: [
    { name: 'Client Scheduler', href: '/touchpoints/bookings', icon: Calendar },
    { name: 'Form Builder', href: '/touchpoints/forms', icon: Sliders },
    { name: 'Live Chat', href: '/touchpoints/salesiq', icon: MessagesSquare },
  ],
  marketing: [
    { name: 'Marketing Automation', href: '/marketing/automation', icon: Activity },
    { name: 'Campaigns', href: '/marketing/campaigns', icon: FileText },
    { name: 'Survey', href: '/marketing/survey', icon: HelpCircle },
  ],
  growth: [
    { name: 'Social Publisher', href: '/growth/social', icon: Layers },
    { name: 'Website Builder', href: '/growth/sites', icon: FolderTree },
    { name: 'Affiliate Hub', href: '/growth/thrive', icon: Wallet },
  ],
  media: [
    { name: 'e-Signatures', href: '/media/sign', icon: FileText },
    { name: 'Conferencing', href: '/media/vani', icon: Video },
  ],
};

const suiteDefaultPaths: Record<SuiteName, string> = {
  hr: '/hr/directory',
  it: '/it/helpdesk',
  finance: '/finance/expenses',
  comms: '/comms/wiki',
  project: '/project/kanban',
  performance: '/performance/okrs',
  facility: '/facility/rooms',
  onboarding: '/onboarding/checklists',
  vault: '/vault/credentials',
  admin: '/admin/fields',
  sales: '/sales/crm',
  touchpoints: '/touchpoints/bookings',
  marketing: '/marketing/automation',
  growth: '/growth/social',
  media: '/media/sign',
};

// Filter Allowed App launcher suites based on Role (direct matrix mapping)
const getAllowedSuites = (role: UserRole): SuiteName[] => {
  return suitePermissions[role] || ['comms'];
};

// Filter Allowed Sub-modules inside contextual sidebar
const getAllowedSubmenu = (suite: SuiteName, role: UserRole, department: string) => {
  const items = suiteSubmenu[suite] || [];
  if (role === 'SuperAdmin') return items;
  
  if (role === 'Employee') {
    if (suite === 'hr') {
      return items.filter(i => i.href === '/hr/directory' || i.href === '/hr/leaves');
    }
    if (suite === 'it') {
      return items.filter(i => i.href === '/it/helpdesk');
    }
  }
  
  if (role === 'Manager') {
    if (suite === 'hr') {
      return items.filter(i => i.href === '/hr/directory' || i.href === '/hr/leaves');
    }
  }

  if (role === 'HRAdmin') {
    if (suite === 'finance' || suite === 'admin' || suite === 'vault') {
      return [];
    }
  }
  
  return items;
};

export default function CommandSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeSuite, switchSuite, activeUser } = useAppState();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const allowedSuites = getAllowedSuites(activeUser.role);
  const allowedSubmenu = getAllowedSubmenu(activeSuite, activeUser.role, activeUser.department);

  const handleSuiteClick = (suiteId: SuiteName) => {
    switchSuite(suiteId);
    const submenu = getAllowedSubmenu(suiteId, activeUser.role, activeUser.department);
    const targetPath = submenu[0]?.href || suiteDefaultPaths[suiteId] || '/';
    router.push(targetPath);
  };

  return (
    <div className="flex h-full shrink-0 select-none">
      
      {/* 1. Left Icon Selector Bar (Narrow strip in #EAE8E3) */}
      <div className="w-16 bg-[#EAE8E3] border-r border-[#E2E1DD] flex flex-col items-center py-4 justify-between h-full">
        <div className="space-y-3 w-full flex flex-col items-center overflow-y-auto flex-1 max-h-[85vh] pr-0">
          {/* Dashboard Home Icon */}
          <Link
            href="/"
            className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 ${
              pathname === '/'
                ? 'bg-[#E1FF4B] border-[#C0D930] text-black shadow-[0_4px_12px_rgba(225,255,75,0.35)]'
                : 'bg-transparent border-transparent text-[#5E6258] hover:text-[#1A1C18] hover:bg-white/40'
            }`}
            title="Dashboard Overview"
          >
            <Home className="h-5 w-5" />
          </Link>

          <div className="h-[1px] w-8 bg-[#D4D2CD] shrink-0" />

          {/* Suite Selectors */}
          {suites.map((suite) => {
            const hasAccess = allowedSuites.includes(suite.id);
            if (!hasAccess) return null;

            const isSuiteActive = activeSuite === suite.id && pathname !== '/';
            const SuiteIcon = suite.icon;

            return (
              <button
                key={suite.id}
                onClick={() => handleSuiteClick(suite.id)}
                className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 ${suite.glow} ${
                  isSuiteActive
                    ? 'bg-[#E1FF4B] border-[#C0D930] text-black shadow-[0_4px_12px_rgba(225,255,75,0.35)] font-extrabold'
                    : 'bg-transparent border-transparent text-[#5E6258] hover:bg-white/40 hover:text-[#1A1C18]'
                }`}
                title={suite.name}
              >
                <SuiteIcon className="h-5 w-5" />
              </button>
            );
          })}
        </div>

        {/* Brand Icon Footer & Collapse Button */}
        <div className="w-full flex flex-col items-center gap-3 shrink-0">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 rounded-lg border border-[#E2E1DD] bg-white flex items-center justify-center text-[#5E6258] hover:text-black hover:bg-[#FAF9F6] transition-all cursor-pointer shadow-sm"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
          </button>
          
          <div className="h-9 w-9 bg-black rounded-xl flex items-center justify-center text-white font-extrabold text-[10px]">
            OS
          </div>
        </div>
      </div>

      {/* 2. Sub-module Sidebar Pane (Wide Panel in #F0EEE9) */}
      <div 
        className={`bg-[#F0EEE9] border-r border-[#E2E1DD] flex flex-col h-full transition-all duration-300 ease-in-out relative overflow-hidden shrink-0 ${
          isCollapsed ? 'w-0' : 'w-52'
        }`}
      >
        {/* Active Suite Header */}
        <div className="h-16 flex items-center px-5 border-b border-[#E2E1DD] shrink-0">
          <span className="text-[10px] font-extrabold text-[#1A1C18] uppercase tracking-wider truncate">
            {suites.find(s => s.id === activeSuite)?.name}
          </span>
        </div>

        {/* Sub Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {pathname === '/' ? (
            <div className="text-center py-10 px-4">
              <p className="text-[10px] font-extrabold text-[#5E6258] uppercase leading-relaxed">
                Active Dashboard
              </p>
              <p className="text-[9px] text-[#8C9086] mt-2 leading-relaxed font-semibold">
                Select a suite icon on the left strip to load functional suites.
              </p>
            </div>
          ) : (
            allowedSubmenu.map((sub) => {
              const isSubActive = pathname === sub.href;
              const SubIcon = sub.icon;
              return (
                <Link
                  key={sub.name}
                  href={sub.href}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 group ${
                    isSubActive
                      ? 'bg-white text-black border border-[#E2E1DD] shadow-sm font-extrabold border-l-4 border-l-[#E1FF4B]'
                      : 'text-[#5E6258] hover:bg-white/40 hover:text-black'
                  }`}
                >
                  <SubIcon
                    className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                      isSubActive ? 'text-[#C0D930]' : 'text-[#8C9086] group-hover:text-[#5E6258]'
                    }`}
                  />
                  <span className="truncate">{sub.name}</span>
                </Link>
              );
            })
          )}
        </nav>
      </div>

    </div>
  );
}
