'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import CommandSidebar from '@/components/CommandSidebar';
import Header from '@/components/Header';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketing = pathname ? pathname.startsWith('/landing') : false;

  if (isMarketing) {
    return (
      <div className="flex-1 h-full overflow-y-auto bg-[#090A09] text-white relative">
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Double-Pane persistent Suite Sidebar switcher */}
      <CommandSidebar />

      {/* Main workspace container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header bar session controllers */}
        <Header />

        {/* Scrollable view container */}
        <main className="flex-1 overflow-y-auto bg-[#F4F3EF] relative">
          {children}
        </main>
      </div>
    </>
  );
}
