'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { ShieldAlert, Check, X, ShieldCheck, Save } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface PermissionRow {
  suite: string;
  employee: boolean;
  manager: boolean;
  superAdmin: boolean;
}

const initialRows: PermissionRow[] = [
  { suite: 'HR Operations Suite', employee: true, manager: true, superAdmin: true },
  { suite: 'Financial Ledger Suite', employee: false, manager: true, superAdmin: true },
  { suite: 'IT & Service Suite', employee: true, manager: true, superAdmin: true },
  { suite: 'Asynchronous Comms Suite', employee: true, manager: true, superAdmin: true },
  { suite: 'Admin Command Center', employee: false, manager: false, superAdmin: true },
];

export default function AdminRBACPage() {
  const { activeUser } = useAppState();
  const [rows, setRows] = useState<PermissionRow[]>(initialRows);

  // Strict SuperAdmin clearance check
  const hasAccess = activeUser.role === 'SuperAdmin';
  if (!hasAccess) {
    return <AccessDenied suite="Command Center" role={activeUser.role} />;
  }

  const togglePermission = (suite: string, role: 'employee' | 'manager' | 'superAdmin') => {
    setRows(prev => prev.map(r => {
      if (r.suite === suite) {
        return {
          ...r,
          [role]: !r[role]
        };
      }
      return r;
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div className="border-b border-[#E2E1DD] pb-4">
        <h2 className="text-3xl font-extrabold text-black tracking-tight flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-black shadow-sm" />
          Role Configuration
        </h2>
        <p className="text-sm text-[#5E6258] mt-1">Configure role permissions, toggle security clearances, and update routing matrices.</p>
      </div>

      {/* Main Grid Panel */}
      <div className="bg-white border border-[#E2E1DD] border border-[#E2E1DD] rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E1DD]/60 pb-3">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-black" /> Clearance Access Matrix
          </h3>
          <span className="text-[9px] text-[#5E6258] font-bold uppercase">Dynamic arbitration rules</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E1DD] text-[10px] font-bold uppercase tracking-wider text-[#5E6258]">
                <th className="py-3 px-4">System Module Suite</th>
                <th className="py-3 px-4 text-center">Employee Role</th>
                <th className="py-3 px-4 text-center">Manager Role</th>
                <th className="py-3 px-4 text-center">SuperAdmin Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E1DD]/40 text-xs text-[#5E6258]">
              {rows.map((row) => (
                <tr key={row.suite} className="hover:bg-[#FAF9F6]">
                  <td className="py-4 px-4 font-bold text-black">{row.suite}</td>
                  
                  {/* Employee Toggle */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => togglePermission(row.suite, 'employee')}
                      className={`h-7 w-7 rounded-lg border transition-all inline-flex items-center justify-center ${
                        row.employee 
                          ? 'bg-black hover:bg-black/90/10 border-[#C0D930]/30 text-[#3CD070]'
                          : 'bg-[#FF3E3E]/10 border-[#FF3E3E]/30 text-[#FF3E3E]'
                      }`}
                    >
                      {row.employee ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                  </td>

                  {/* Manager Toggle */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => togglePermission(row.suite, 'manager')}
                      className={`h-7 w-7 rounded-lg border transition-all inline-flex items-center justify-center ${
                        row.manager 
                          ? 'bg-black hover:bg-black/90/10 border-[#C0D930]/30 text-[#3CD070]'
                          : 'bg-[#FF3E3E]/10 border-[#FF3E3E]/30 text-[#FF3E3E]'
                      }`}
                    >
                      {row.manager ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                  </td>

                  {/* SuperAdmin Toggle */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => togglePermission(row.suite, 'superAdmin')}
                      className={`h-7 w-7 rounded-lg border transition-all inline-flex items-center justify-center ${
                        row.superAdmin 
                          ? 'bg-black hover:bg-black/90/10 border-[#C0D930]/30 text-[#3CD070]'
                          : 'bg-[#FF3E3E]/10 border-[#FF3E3E]/30 text-[#FF3E3E]'
                      }`}
                    >
                      {row.superAdmin ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#E2E1DD]/60 flex justify-end">
          <button 
            onClick={() => alert('Permissions updated successfully in local session memory!')}
            className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-black/90 hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-400/10 cursor-pointer"
          >
            <Save className="h-4 w-4" /> Commit Permissions
          </button>
        </div>

      </div>
    </div>
  );
}
