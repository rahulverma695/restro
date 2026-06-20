'use client';

import React from 'react';
import { useAppState } from '@/context/StateContext';
import { DollarSign, ShieldAlert, Cloud, Calendar, User, TrendingUp } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function VendorsPage() {
  const { activeUser, saasVendors, employees } = useAppState();

  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'Manager' || 
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="Financial Ledger" role={activeUser.role} />;
  }

  // Calculate monthly total SaaS burn
  const totalBurn = saasVendors.reduce((sum, v) => sum + v.cost, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E1DD] pb-4">
        <Cloud className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Vendor SaaS Tracker</h2>
          <p className="text-sm text-[#5E6258] mt-1">Monitor company-wide third-party software subscriptions, monthly expenditures, and ownership assignments.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#5E6258]">Total SaaS Subscriptions</span>
            <p className="text-2xl font-extrabold text-[#1A1C18]">{saasVendors.length} Subscribed</p>
          </div>
          <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E2E1DD]">
            <Cloud className="h-5 w-5 text-black" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#5E6258]">Total Monthly Burn</span>
            <p className="text-2xl font-extrabold text-[#FF3E3E]">${totalBurn.toLocaleString()}/mo</p>
          </div>
          <div className="bg-[#FF3E3E]/10 p-2.5 rounded-xl border border-[#FF3E3E]/20 text-[#FF3E3E]">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#5E6258]">Annual SaaS Burn Runrate</span>
            <p className="text-2xl font-extrabold text-black">${(totalBurn * 12).toLocaleString()}/yr</p>
          </div>
          <div className="bg-amber-400/10 p-2.5 rounded-xl border border-amber-400/20 text-amber-500">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Vendors List Ledger */}
      <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">Active Subscriptions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saasVendors.map((vendor) => {
            const owner = employees.find(e => e.id === vendor.owner_id);
            return (
              <div 
                key={vendor.id} 
                className="bg-[#FAF9F6] border border-[#E2E1DD] hover:border-[#8B5CF6]/30 rounded-xl p-5 space-y-4 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-[#E2E1DD]/50 pb-2">
                    <h4 className="text-sm font-extrabold text-black truncate max-w-[150px]">{vendor.name}</h4>
                    <span className="text-[9px] font-extrabold text-[#3CD070] bg-[#3CD070]/10 border border-[#3CD070]/20 px-2 py-0.5 rounded uppercase">
                      Cleared
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[10px] text-[#5E6258]">
                      <span>Monthly cost</span>
                      <span className="font-extrabold text-black">${vendor.cost.toLocaleString()} / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-[#5E6258]">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Next Renewal</span>
                      <span className="font-semibold text-black">{vendor.renewal_date}</span>
                    </div>
                  </div>
                </div>

                {/* Owner profile card */}
                <div className="border-t border-[#E2E1DD]/70 pt-3 flex items-center justify-between text-xs">
                  <span className="text-[8px] text-[#8C9086] font-bold uppercase">Internal Owner</span>
                  {owner ? (
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-[#EAE8E3] border border-[#E2E1DD] rounded-md flex items-center justify-center font-bold text-[9px] text-black">
                        {owner.first_name[0]}{owner.last_name[0]}
                      </div>
                      <span className="font-bold text-black">{owner.first_name} {owner.last_name}</span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-[#8C9086] font-bold">Unassigned</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
