'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { Key, Copy, Eye, EyeOff, ShieldCheck, Clipboard } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function VaultPage() {
  const { activeUser, vaultCredentials } = useAppState();
  const [visibleIds, setVisibleIds] = useState<Record<string, boolean>>({});

  const toggleVisibility = (id: string) => {
    setVisibleIds(prev => ({ ...prev, [id] : !prev[id] }));
  };

  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'HRAdmin' || 
    activeUser.role === 'Manager' || 
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="Secure Vault" role={activeUser.role} />;
  }

  // Filter credentials strictly by RBAC department tags (SuperAdmin gets all)
  const allowedCredentials = activeUser.role === 'SuperAdmin'
    ? vaultCredentials
    : vaultCredentials.filter(c => c.department === activeUser.department);

  const handleCopy = (plainText: string) => {
    navigator.clipboard.writeText(plainText);
    alert('Credential password copied to clipboard securely!');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E1DD] pb-4">
        <Key className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Credentials Vault</h2>
          <p className="text-sm text-[#5E6258] mt-1">Role-locked password vault. Access shared corporate log-ins corresponding to your authorization department tag.</p>
        </div>
      </div>

      {/* Vault grid container */}
      <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#C0D930]" /> Encrypted Credentials Ledger
          </h3>
          <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-2.5 py-0.5 rounded-full uppercase">
            {activeUser.role === 'SuperAdmin' ? 'Root Vault' : `${activeUser.department} Node`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allowedCredentials.map((cred) => (
            <div 
              key={cred.id} 
              className="bg-[#FAF9F6] border border-[#E2E1DD] hover:border-[#8B5CF6]/30 rounded-xl p-5 space-y-4 transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="border-b border-[#E2E1DD]/50 pb-2">
                  <h4 className="text-xs font-extrabold text-black truncate max-w-[200px]" title={cred.name}>
                    {cred.name}
                  </h4>
                  <p className="text-[8px] text-[#8C9086] font-mono leading-none mt-1">{cred.url}</p>
                </div>

                <div className="space-y-2.5 text-xs text-[#5E6258]">
                  <div>
                    <span className="text-[8px] text-[#8C9086] font-bold uppercase">Username</span>
                    <p className="font-semibold text-black mt-0.5 select-all">{cred.username}</p>
                  </div>
                  <div>
                    <span className="text-[8px] text-[#8C9086] font-bold uppercase">Shared Password</span>
                    <div className="flex items-center justify-between mt-0.5 bg-white border border-[#E2E1DD] rounded-lg px-2.5 py-1 text-xs">
                      <span className="font-mono text-black font-semibold truncate max-w-[120px] select-none">
                        {visibleIds[cred.id] ? cred.password_plain : cred.password_masked}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => toggleVisibility(cred.id)}
                          className="h-6 w-6 hover:bg-[#FAF9F6] rounded flex items-center justify-center text-[#8C9086] hover:text-black cursor-pointer transition-colors border border-[#E2E1DD]/50"
                          title={visibleIds[cred.id] ? "Hide password" : "Show password"}
                        >
                          {visibleIds[cred.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button 
                          onClick={() => handleCopy(cred.password_plain)}
                          className="h-6 w-6 hover:bg-[#FAF9F6] rounded flex items-center justify-center text-[#8C9086] hover:text-black cursor-pointer transition-colors border border-[#E2E1DD]/50"
                          title="Copy password to clipboard securely"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department badge footer */}
              <div className="border-t border-[#E2E1DD]/70 pt-3 flex items-center justify-between text-[9px] text-[#8C9086] font-bold uppercase">
                <span>Vault Node Tag</span>
                <span className="text-[#8B5CF6]">{cred.department}</span>
              </div>

            </div>
          ))}
          {allowedCredentials.length === 0 && (
            <p className="text-xs text-[#8C9086] italic text-center col-span-3 py-12">No credential keys logged in this department vault.</p>
          )}
        </div>
      </div>

    </div>
  );
}
