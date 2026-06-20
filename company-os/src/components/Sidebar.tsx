'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  HelpCircle, 
  BookOpen, 
  Building
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Directory', href: '/directory', icon: Users },
  { name: 'Time & Leaves', href: '/leaves', icon: Calendar },
  { name: 'Helpdesk Tickets', href: '/helpdesk', icon: HelpCircle },
  { name: 'Wiki Docs', href: '/wiki', icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0B0F19] text-[#94A3B8] border-r border-[#1E293B] flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#1E293B] gap-3">
        <div className="bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] p-2 rounded-lg text-white">
          <Building className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide text-md">CompanyOS</h1>
          <span className="text-xs text-[#8B5CF6] font-semibold tracking-wider uppercase">Self Hosted</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          // exact path check or subpath check (specifically for wiki/helpdesk details)
          const isActive = item.href === '/' 
            ? pathname === '/' 
            : pathname.startsWith(item.href);
            
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
                isActive
                  ? 'bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 text-white border-l-2 border-[#6366F1]'
                  : 'hover:bg-[#1E293B]/50 hover:text-white'
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-colors duration-200 ${
                  isActive ? 'text-[#6366F1]' : 'text-[#475569] group-hover:text-[#94A3B8]'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Intranet Indicator */}
      <div className="p-4 border-t border-[#1E293B] bg-[#0E1527]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Local Node Active</p>
            <p className="text-[10px] text-[#475569]">Encrypted Data Sovereignty</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
