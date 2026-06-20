'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Users } from 'lucide-react';

interface AccessDeniedProps {
  suite: string;
  role: string;
}

export default function AccessDenied({ suite, role }: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center select-none bg-[#F4F3EF]">
      <div className="max-w-md w-full bg-white border border-[#E2E1DD] rounded-2xl p-8 space-y-6 shadow-sm relative overflow-hidden">
        
        {/* Shield Icon container */}
        <div className="mx-auto h-16 w-16 bg-[#FF3E3E]/10 border border-[#FF3E3E]/20 rounded-2xl flex items-center justify-center text-[#FF3E3E] shadow-sm">
          <ShieldAlert className="h-8 w-8" />
        </div>

        {/* Text Details */}
        <div className="space-y-2 relative z-10">
          <h3 className="text-lg font-bold text-black uppercase tracking-wider">Access Restrict Command</h3>
          <p className="text-xs text-[#5E6258] leading-relaxed font-semibold">
            Your current authorization level <span className="text-[#FF3E3E] font-extrabold">{role}</span> is not cleared to view the <span className="text-[#C0D930] font-extrabold">{suite} Suite</span>.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 text-left space-y-1 relative z-10">
          <p className="text-[10px] font-bold text-[#5E6258] uppercase tracking-wider">System Rule Security</p>
          <p className="text-[10px] text-[#5E6258] leading-normal">
            Intranet policies restrict this suite to Managers and SuperAdmins. If this clearance is incorrect, contact IT Service desk or switch to a high-clearance test account in the top right.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Go to Dashboard
          </Link>
          <div className="flex-1 text-[10px] text-[#5E6258] flex items-center justify-center gap-1.5 border border-[#E2E1DD] rounded-xl bg-[#FAF9F6] py-2 font-bold uppercase tracking-wider">
            <Users className="h-3.5 w-3.5 text-[#8C9086]" /> Use Switcher
          </div>
        </div>

      </div>
    </div>
  );
}
