'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Clock, 
  Plus, 
  ChevronRight, 
  User, 
  Building2, 
  Trash2, 
  FolderKanban,
  CheckCircle,
  Briefcase
} from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: 'Lead' | 'Contacted' | 'Proposal' | 'Negotiating' | 'Won' | 'Lost';
  contactPerson: string;
  email: string;
  phone: string;
}

const initialDeals: Deal[] = [
  { id: 'deal-1', name: 'Premium POS Enterprise Rollout', company: 'Grill & Chill Corp', value: 45000, stage: 'Proposal', contactPerson: 'Sarah Jenkins', email: 'sarah.j@grillchill.com', phone: '+1 (555) 019-2834' },
  { id: 'deal-2', name: 'Software Upgrade - 12 Branches', company: 'Urban Diner Group', value: 18000, stage: 'Contacted', contactPerson: 'Mark R.', email: 'mark@urbandiner.io', phone: '+1 (555) 014-9988' },
  { id: 'deal-3', name: 'Hardware Terminal Bundle', company: 'Mama Pizza chain', value: 25000, stage: 'Negotiating', contactPerson: 'Luigi Rossi', email: 'luigi@mamapizza.net', phone: '+1 (555) 017-4567' },
  { id: 'deal-4', name: 'Cloud Intranet Subscription', company: 'Bistro Collective', value: 8500, stage: 'Lead', contactPerson: 'Claire Bennett', email: 'claire@bistrocol.com', phone: '+1 (555) 012-3456' },
  { id: 'deal-5', name: 'Custom CRM API Integration', company: 'Star Foods Inc', value: 15000, stage: 'Won', contactPerson: 'David Vance', email: 'david@starfoods.com', phone: '+1 (555) 013-8877' },
  { id: 'deal-6', name: 'Legacy Software Migration', company: 'QuickBite Franchise', value: 32000, stage: 'Lost', contactPerson: 'Emma Watson', email: 'emma@quickbite.com', phone: '+1 (555) 011-1234' }
];

const STAGES: Deal['stage'][] = ['Lead', 'Contacted', 'Proposal', 'Negotiating', 'Won', 'Lost'];

export default function CRMPage() {
  const { activeUser } = useAppState();
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeal, setNewDeal] = useState<Omit<Deal, 'id' | 'stage'>>({
    name: '',
    company: '',
    value: 0,
    contactPerson: '',
    email: '',
    phone: ''
  });

  const hasAccess = ['SuperAdmin', 'HRAdmin', 'Manager', 'Employee'].includes(activeUser.role);

  if (!hasAccess) {
    return <AccessDenied suite="Sales CRM" role={activeUser.role} />;
  }

  // Drag-and-drop Handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: Deal['stage']) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (!dealId) return;

    setDeals(prev => prev.map(deal => {
      if (deal.id === dealId) {
        return { ...deal, stage: targetStage };
      }
      return deal;
    }));
  };

  // Add Deal Handler
  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.name || !newDeal.company) return;

    const deal: Deal = {
      ...newDeal,
      id: `deal-${Date.now()}`,
      stage: 'Lead'
    };

    setDeals(prev => [...prev, deal]);
    setNewDeal({ name: '', company: '', value: 0, contactPerson: '', email: '', phone: '' });
    setShowAddForm(false);
  };

  const deleteDeal = (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  };

  // Analytics Metrics
  const totalPipelineValue = deals.reduce((acc, curr) => curr.stage !== 'Lost' ? acc + curr.value : acc, 0);
  const wonDeals = deals.filter(d => d.stage === 'Won');
  const lostDeals = deals.filter(d => d.stage === 'Lost');
  const closedDealsCount = wonDeals.length + lostDeals.length;
  const winRate = closedDealsCount > 0 ? Math.round((wonDeals.length / closedDealsCount) * 100) : 0;
  const avgDealValue = deals.length > 0 ? Math.round(totalPipelineValue / (deals.length - lostDeals.length)) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F4F3EF] min-h-[calc(100vh-4rem)] select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Sales CRM — Deal Pipelines</h2>
            <p className="text-sm text-[#5E6258] mt-1">Manage corporate deal flows, pipelines, and customer relationship analytics with zero per-seat storage fees.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#E1FF4B] border border-[#C0D930] hover:bg-[#d5f242] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Deal
        </button>
      </div>

      {/* Sales Analytics Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E2E1DD] p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-[#8C9086] font-bold uppercase tracking-wider">Active Pipeline Value</span>
            <h3 className="text-2xl font-black text-black">${totalPipelineValue.toLocaleString()}</h3>
          </div>
          <div className="h-10 w-10 bg-[#8B5CF6]/10 rounded-xl flex items-center justify-center text-[#8B5CF6]">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E1DD] p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-[#8C9086] font-bold uppercase tracking-wider">Win Rate (Closed)</span>
            <h3 className="text-2xl font-black text-black">{winRate}%</h3>
          </div>
          <div className="h-10 w-10 bg-[#C0D930]/10 rounded-xl flex items-center justify-center text-[#C0D930]">
            <Percent className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E1DD] p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-[#8C9086] font-bold uppercase tracking-wider">Avg Deal Value</span>
            <h3 className="text-2xl font-black text-black">${avgDealValue.toLocaleString()}</h3>
          </div>
          <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Add Deal Modal Overlay */}
      {showAddForm && (
        <div className="bg-white border border-[#E2E1DD] p-6 rounded-2xl shadow-md max-w-xl mx-auto space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2">
            Register New Deal
          </h3>
          <form onSubmit={handleAddDeal} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Deal Opportunity Name</label>
              <input 
                type="text" 
                placeholder="e.g. 50 Hardware Terminals Rollout"
                value={newDeal.name}
                onChange={e => setNewDeal(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Company</label>
              <input 
                type="text" 
                placeholder="e.g. Pizza Hut Group"
                value={newDeal.company}
                onChange={e => setNewDeal(prev => ({ ...prev, company: e.target.value }))}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Deal Value ($)</label>
              <input 
                type="number" 
                placeholder="Value"
                value={newDeal.value || ''}
                onChange={e => setNewDeal(prev => ({ ...prev, value: Number(e.target.value) }))}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Contact Person</label>
              <input 
                type="text" 
                placeholder="Name"
                value={newDeal.contactPerson}
                onChange={e => setNewDeal(prev => ({ ...prev, contactPerson: e.target.value }))}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Email</label>
              <input 
                type="email" 
                placeholder="email@example.com"
                value={newDeal.email}
                onChange={e => setNewDeal(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
              />
            </div>
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-xs text-[#8C9086] bg-[#FAF9F6] border border-[#E2E1DD] px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="text-xs text-black bg-[#E1FF4B] border border-[#C0D930] px-4 py-2 rounded-xl font-bold"
              >
                Add to Leads
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start">
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage);
          const stageSum = stageDeals.reduce((sum, curr) => sum + curr.value, 0);

          return (
            <div 
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="bg-white border border-[#E2E1DD] rounded-2xl p-4 flex flex-col gap-4 min-h-[500px]"
            >
              {/* Stage Header */}
              <div className="border-b border-[#E2E1DD] pb-2 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-black uppercase tracking-wider">{stage}</span>
                  <span className="text-[9px] text-[#8C9086] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-1.5 py-0.5 rounded-full">
                    {stageDeals.length}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#8B5CF6]">${stageSum.toLocaleString()}</span>
              </div>

              {/* Deal Cards */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[450px]">
                {stageDeals.map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    className="bg-[#FAF9F6] border border-[#E2E1DD] hover:border-[#8B5CF6]/30 rounded-xl p-3.5 space-y-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all"
                  >
                    <div>
                      <h4 className="text-[11px] font-black text-black leading-tight truncate">{deal.name}</h4>
                      <p className="text-[9px] text-[#8C9086] font-bold flex items-center gap-1 mt-1">
                        <Building2 className="h-3 w-3" /> {deal.company}
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-[#E2E1DD]/70 pt-2 text-[9px] text-[#5E6258]">
                      <span className="font-extrabold text-[#8B5CF6]">${deal.value.toLocaleString()}</span>
                      <button 
                        onClick={() => deleteDeal(deal.id)}
                        className="text-[#8C9086] hover:text-red-500 transition-colors"
                        title="Delete Deal"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="border border-dashed border-[#E2E1DD] rounded-xl py-10 flex flex-col items-center justify-center text-[10px] text-[#8C9086] italic text-center">
                    Drag items here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
