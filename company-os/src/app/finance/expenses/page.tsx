'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { FileText, Check, X, DollarSign, Upload, ClipboardList, PlusCircle } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function ExpensesPage() {
  const { activeUser, receiptClaims, employees, addReceiptClaim, approveReceiptClaim } = useAppState();

  // Receipt capture input states
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Hardware');

  // RBAC validation check
  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'Manager' || 
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="Financial Ledger" role={activeUser.role} />;
  }

  const isManagerOrAdmin = activeUser.role === 'SuperAdmin' || activeUser.role === 'Manager';

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!item.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;
    addReceiptClaim(item.trim(), parsedAmount, category);
    setItem('');
    setAmount('');
    alert('Receipt submitted successfully for approval!');
  };

  const pendingClaims = receiptClaims.filter(c => c.status === 'pending');
  const auditedClaims = receiptClaims.filter(c => c.status !== 'pending');

  // For standard employee, only filter their own claims
  const myPendingClaims = pendingClaims.filter(c => c.employee_id === activeUser.id);
  const myAuditedClaims = auditedClaims.filter(c => c.employee_id === activeUser.id);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="border-b border-[#E2E1DD] pb-4">
        <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight flex items-center gap-3">
          <FileText className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
          Financial & Expense Claims
        </h2>
        <p className="text-sm text-[#5E6258] mt-1">Upload corporate expense receipts, capture invoice categories, and audit claims clearance logs.</p>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column(s) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Receipt Capture Form (For everyone, but highly relevant for employees) */}
          <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E1DD] pb-2">
              <PlusCircle className="h-4 w-4 text-[#C0D930]" /> New Receipt Capture Claim
            </h3>
            
            <form onSubmit={handleSubmitClaim} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#5E6258]">Purchased Item / Service</label>
                <input 
                  type="text" 
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  required
                  placeholder="e.g. Figma Pro subscription..."
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#5E6258]">Total Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#5E6258] font-bold">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl pl-7 pr-3.5 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#5E6258]">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3.5 py-2 text-xs text-black focus:outline-none transition-all"
                >
                  <option value="Hardware">Hardware Equipment</option>
                  <option value="Software SaaS">Software & SaaS Licenses</option>
                  <option value="Travel">Travel & Transit Logs</option>
                  <option value="Office Snacks">Office Catering & Snacks</option>
                  <option value="Utilities">Utilities & Infrastructure</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#5E6258]">Receipt Invoice File</label>
                <div className="border border-dashed border-[#E2E1DD] hover:border-[#C0D930] bg-[#FAF9F6] rounded-xl px-3 py-1.5 flex items-center justify-center gap-2 cursor-pointer transition-all text-[#5E6258] hover:text-black">
                  <Upload className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">Upload Invoice Image (PDF/PNG)</span>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2">
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Megaphone Receipt Submission
                </button>
              </div>
            </form>
          </div>

          {/* 2. Receipts Approvals Queue (Only managers and SuperAdmins see this, employees see their own pending claims list) */}
          {isManagerOrAdmin ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[#8B5CF6] rounded-full"></span>
                Receipt approvals queue ({pendingClaims.length})
              </h3>
              
              <div className="space-y-4">
                {pendingClaims.map(claim => {
                  const staff = employees.find(e => e.id === claim.employee_id);
                  return (
                    <div 
                      key={claim.id} 
                      className="bg-white border border-[#E2E1DD] hover:border-[#8B5CF6]/20 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-black">{staff?.first_name} {staff?.last_name}</span>
                          <span className="text-[9px] text-[#5E6258] font-bold uppercase tracking-wider">({staff?.department})</span>
                          <span className="text-[9px] text-[#8C9086] font-semibold">{claim.date}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-[#1A1C18]">"{claim.item}"</h4>
                        <span className="text-[8px] font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-2 py-0.5 rounded uppercase">
                          {claim.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#E2E1DD] pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[9px] font-bold text-[#5E6258] uppercase tracking-wider">Claim Amount</span>
                          <p className="text-sm font-extrabold text-black flex items-center gap-0.5">
                            <DollarSign className="h-3.5 w-3.5" />{claim.amount.toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => approveReceiptClaim(claim.id, 'approved')}
                            className="h-8 w-8 bg-black hover:bg-black/90/10 border border-[#C0D930]/30 text-[#3CD070] rounded-xl flex items-center justify-center hover:bg-black hover:bg-black/90/20 transition-all cursor-pointer shadow-sm"
                            title="Approve Claim"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => approveReceiptClaim(claim.id, 'rejected')}
                            className="h-8 w-8 bg-[#FF3E3E]/10 border border-[#FF3E3E]/30 text-[#FF3E3E] rounded-xl flex items-center justify-center hover:bg-[#FF3E3E]/20 transition-all cursor-pointer shadow-sm"
                            title="Reject Claim"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {pendingClaims.length === 0 && (
                  <div className="text-center py-12 bg-white border border-[#E2E1DD] rounded-2xl text-xs text-[#5E6258] italic shadow-sm">
                    All employee reimbursement claims have been cleared.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Employee's personal pending claims */
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[#8B5CF6] rounded-full"></span>
                My Pending Reimbursement Claims ({myPendingClaims.length})
              </h3>
              
              <div className="space-y-4">
                {myPendingClaims.map(claim => (
                  <div 
                    key={claim.id} 
                    className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex justify-between items-center transition-all shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[9px] text-[#8C9086]">
                        <span>{claim.date}</span>
                        <span>•</span>
                        <span className="capitalize">{claim.category}</span>
                      </div>
                      <h4 className="text-xs font-bold text-black">"{claim.item}"</h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-bold text-[#8C9086] uppercase">Amount</span>
                      <p className="text-sm font-extrabold text-black">${claim.amount.toFixed(2)}</p>
                      <span className="text-[7px] font-extrabold text-amber-500 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.2 rounded uppercase mt-0.5 inline-block">
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))}
                {myPendingClaims.length === 0 && (
                  <p className="text-xs text-[#8C9086] italic py-4">No pending claims submitted.</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Audited history logs (Managers see all, Employees see only theirs) */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 space-y-4 h-fit shadow-sm">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E1DD] pb-2">
            <ClipboardList className="h-4 w-4 text-[#8C9086]" /> Audit Log Ledger
          </h3>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {(isManagerOrAdmin ? auditedClaims : myAuditedClaims).map(claim => {
              const staff = employees.find(e => e.id === claim.employee_id);
              return (
                <div key={claim.id} className="bg-[#FAF9F6] border border-[#E2E1DD]/60 rounded-xl p-3 flex justify-between items-center text-xs">
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="font-bold text-black truncate">{isManagerOrAdmin ? `${staff?.first_name} ${staff?.last_name}` : claim.item}</p>
                    <p className="text-[8px] text-[#8C9086] font-semibold truncate capitalize">{claim.category} • {claim.date}</p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="font-bold text-black">${claim.amount.toFixed(2)}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[7px] font-extrabold uppercase inline-block mt-0.5 ${
                      claim.status === 'approved' 
                        ? 'bg-[#3CD070]/10 text-[#3CD070] border border-[#3CD070]/20' 
                        : 'bg-[#FF3E3E]/10 text-[#FF3E3E] border-[#FF3E3E]/20'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
              );
            })}
            {(isManagerOrAdmin ? auditedClaims : myAuditedClaims).length === 0 && (
              <p className="text-xs text-[#8C9086] italic text-center py-6">No historical records logged.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
