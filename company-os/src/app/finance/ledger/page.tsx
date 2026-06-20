'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Filter, Plus } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: 'payroll' | 'saas' | 'revenue' | 'hardware' | 'consulting';
  type: 'credit' | 'debit';
  amount: number;
  recordedBy: string;
}

const initialTransactions: Transaction[] = [
  { id: 'tx01', date: '2026-06-12', description: 'Monthly Vercel Enterprise Subscription', category: 'saas', type: 'debit', amount: 3200, recordedBy: 'Jane Smith' },
  { id: 'tx02', date: '2026-06-11', description: 'OmniHub SaaS Platform Licensing - ACME Corp', category: 'revenue', type: 'credit', amount: 48000, recordedBy: 'Jane Smith' },
  { id: 'tx03', date: '2026-06-10', description: 'Engineering Hardware Provision (16x Laptops)', category: 'hardware', type: 'debit', amount: 24500, recordedBy: 'Jane Smith' },
  { id: 'tx04', date: '2026-06-08', description: 'Contractor Consulting retainer fees', category: 'consulting', type: 'debit', amount: 8500, recordedBy: 'Jane Smith' },
  { id: 'tx05', date: '2026-06-05', description: 'Staff Payroll Ledger Draw', category: 'payroll', type: 'debit', amount: 165000, recordedBy: 'Jane Smith' },
  { id: 'tx06', date: '2026-06-02', description: 'OmniHub SaaS Platform Setup - Apex Ltd', category: 'revenue', type: 'credit', amount: 12000, recordedBy: 'Jane Smith' },
];

export default function LedgerPage() {
  const { activeUser } = useAppState();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Transaction entry form states
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<Transaction['category']>('saas');
  const [txType, setTxType] = useState<Transaction['type']>('debit');
  const [amount, setAmount] = useState('');

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // RBAC validation check (Employee is blocked from Finance)
  const hasAccess = activeUser.role === 'SuperAdmin' || activeUser.role === 'Manager';
  if (!hasAccess) {
    return <AccessDenied suite="Financial Ledger" role={activeUser.role} />;
  }

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: desc,
      category: cat,
      type: txType,
      amount: parseFloat(amount) || 0,
      recordedBy: `${activeUser.first_name} ${activeUser.last_name}`,
    };
    setTransactions(prev => [newTx, ...prev]);
    setDesc('');
    setAmount('');
  };

  const filteredTx = transactions.filter(t => {
    const matchesCat = filterCategory === 'all' || t.category === filterCategory;
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesCat && matchesType;
  });

  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((acc, curr) => acc + curr.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((acc, curr) => acc + curr.amount, 0);
  const netLedger = totalCredits - totalDebits;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E1DD] pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-black tracking-tight flex items-center gap-3">
            <Wallet className="h-8 w-8 text-[#3CD070] shadow-sm" />
            Company Ledger
          </h2>
          <p className="text-sm text-[#5E6258] mt-1">Audit company journals, account reconciliations, and payroll expenses.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Credits */}
        <div className="bg-[#FAF9F6] border border-[#E2E1DD] border border-[#E2E1DD]/60 rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#5E6258]">Total Incoming (Credits)</span>
            <p className="text-2xl font-extrabold text-[#3CD070]">+${totalCredits.toLocaleString()}</p>
          </div>
          <div className="bg-black hover:bg-black/90/10 p-2.5 rounded-xl border border-[#C0D930]/20 text-[#3CD070]">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Debits */}
        <div className="bg-[#FAF9F6] border border-[#E2E1DD] border border-[#E2E1DD]/60 rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#5E6258]">Total Outgoing (Debits)</span>
            <p className="text-2xl font-extrabold text-[#FF3E3E]">-${totalDebits.toLocaleString()}</p>
          </div>
          <div className="bg-[#FF3E3E]/10 p-2.5 rounded-xl border border-[#FF3E3E]/20 text-[#FF3E3E]">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-[#FAF9F6] border border-[#E2E1DD] border border-[#E2E1DD]/60 rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#5E6258]">Net Cash Flow</span>
            <p className={`text-2xl font-extrabold ${netLedger >= 0 ? 'text-[#3CD070]' : 'text-[#FF3E3E]'}`}>
              {netLedger >= 0 ? '+' : '-'}${Math.abs(netLedger).toLocaleString()}
            </p>
          </div>
          <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E2E1DD] text-black">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Split Layout: Ledger list and Entry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Transaction Table */}
        <div className="lg:col-span-3 bg-white border border-[#E2E1DD] border border-[#E2E1DD] rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E1DD]/60 pb-3">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">Transaction Records</h3>
            
            {/* Filter selectors */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-[#5E6258]" />
                <span className="text-[10px] text-[#5E6258] font-bold uppercase">Filter:</span>
              </div>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-lg px-2 py-1 text-[10px] text-black focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="payroll">Payroll</option>
                <option value="saas">SaaS Apps</option>
                <option value="revenue">Revenues</option>
                <option value="hardware">Hardware</option>
                <option value="consulting">Consulting</option>
              </select>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-lg px-2 py-1 text-[10px] text-black focus:outline-none"
              >
                <option value="all">All Actions</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E1DD] text-[9px] font-bold uppercase tracking-wider text-[#5E6258]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Journal Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Value</th>
                  <th className="py-2.5 px-3 text-right">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E1DD]/40 text-xs text-[#5E6258]">
                {filteredTx.map(tx => (
                  <tr key={tx.id} className="hover:bg-[#FAF9F6]">
                    <td className="py-3 px-3 font-semibold">{tx.date}</td>
                    <td className="py-3 px-3">
                      <p className="text-black font-bold">{tx.description}</p>
                      <span className="text-[8px] text-[#5E6258] font-extrabold uppercase">{tx.id}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-[#FAF9F6] border border-[#E2E1DD] text-[#5E6258]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${tx.type === 'credit' ? 'text-[#3CD070]' : 'text-[#FF3E3E]'}`}>
                        {tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-[10px]">{tx.recordedBy}</td>
                  </tr>
                ))}
                {filteredTx.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-[#5E6258] italic">
                      No matching transaction vouchers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ledger Entry Form */}
        <div className="bg-white border border-[#E2E1DD] border border-[#E2E1DD] rounded-2xl p-5 h-fit space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#3CD070]" /> Add Ledger Entry
          </h3>
          
          <form onSubmit={handleAddTx} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Description</label>
              <input 
                type="text" 
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
                placeholder="Voucher explanation..."
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Category</label>
              <select 
                value={cat}
                onChange={(e) => setCat(e.target.value as any)}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-[#C0D930]"
              >
                <option value="saas">SaaS Subscriptions</option>
                <option value="revenue">Revenue Share</option>
                <option value="payroll">Payroll Draw</option>
                <option value="hardware">Hardware Asset</option>
                <option value="consulting">Consulting Fees</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Transaction Type</label>
              <select 
                value={txType}
                onChange={(e) => setTxType(e.target.value as any)}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-[#C0D930]"
              >
                <option value="debit">Debit (Expense)</option>
                <option value="credit">Credit (Revenue)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Amount ($)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="1000..."
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-black hover:bg-black/90 hover:bg-black hover:bg-black/90/80 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              Post Journal Voucher
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
