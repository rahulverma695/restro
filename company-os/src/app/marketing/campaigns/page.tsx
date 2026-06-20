'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { 
  FileText, 
  Plus, 
  Send, 
  Users, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Percent,
  CheckCircle,
  Trash2
} from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface Campaign {
  id: string;
  subject: string;
  listName: string;
  scheduledDate: string;
  status: 'Draft' | 'Scheduled' | 'Sent';
  opens: number;
  clicks: number;
  sentCount: number;
  body: string;
}

const initialCampaigns: Campaign[] = [
  { id: 'camp-1', subject: 'Announcing RestroPOS Version 3.5 Upgrade', listName: 'All Active Clients', scheduledDate: '2026-06-12', status: 'Sent', opens: 450, clicks: 120, sentCount: 1000, body: 'We are thrilled to launch RestroPOS v3.5! This upgrade includes offline geofenced check-ins and Neon singleton database hooks...' },
  { id: 'camp-2', subject: 'Exclusive Hardware Bundle Promotions', listName: 'Leads List', scheduledDate: '2026-06-17', status: 'Scheduled', opens: 0, clicks: 0, sentCount: 450, body: 'Get 20% discount on dual screen terminals when pre-ordering this month...' }
];

const RECIPIENT_LISTS = ['All Active Clients', 'Leads List', 'Beta Partners Group', 'Bengaluru Restaurants'];

export default function CampaignsPage() {
  const { activeUser } = useAppState();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Omit<Campaign, 'id' | 'status' | 'opens' | 'clicks' | 'sentCount'>>({
    subject: '',
    listName: RECIPIENT_LISTS[0],
    scheduledDate: '2026-06-18',
    body: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const hasAccess = ['SuperAdmin', 'HRAdmin', 'Manager', 'Employee'].includes(activeUser.role);

  if (!hasAccess) {
    return <AccessDenied suite="Marketing Hub" role={activeUser.role} />;
  }

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.subject || !newCampaign.body) return;

    const campaign: Campaign = {
      ...newCampaign,
      id: `camp-${Date.now()}`,
      status: 'Scheduled',
      opens: 0,
      clicks: 0,
      sentCount: newCampaign.listName.includes('Clients') ? 1000 : 450
    };

    setCampaigns(prev => [campaign, ...prev]);
    setNewCampaign({ subject: '', listName: RECIPIENT_LISTS[0], scheduledDate: '2026-06-18', body: '' });
    setShowAddForm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F4F3EF] min-h-[calc(100vh-4rem)] select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Email Campaigns — Newsletters</h2>
            <p className="text-sm text-[#5E6258] mt-1">Compose HTML email newsletters, schedule delivery lists, and track conversion analytics.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#E1FF4B] border border-[#C0D930] hover:bg-[#d5f242] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create Campaign
        </button>
      </div>

      {showSuccess && (
        <div className="bg-[#C0D930]/10 border border-[#C0D930] rounded-xl p-4 text-xs font-extrabold text-black flex items-center gap-2 max-w-xl">
          <CheckCircle className="h-5 w-5 text-[#C0D930]" />
          Campaign scheduled successfully! Emails will be dispatched on the selected date.
        </div>
      )}

      {/* Campaign compose modal form overlay */}
      {showAddForm && (
        <div className="bg-white border border-[#E2E1DD] p-6 rounded-2xl shadow-md max-w-2xl mx-auto space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2">
            Compose New Email Campaign
          </h3>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Email Subject Line</label>
              <input
                type="text"
                placeholder="e.g. Exclusive POS Hardware discounts..."
                value={newCampaign.subject}
                onChange={e => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2.5 text-xs text-black font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8C9086] uppercase">Target Recipient List</label>
                <select
                  value={newCampaign.listName}
                  onChange={e => setNewCampaign(prev => ({ ...prev, listName: e.target.value }))}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                >
                  {RECIPIENT_LISTS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8C9086] uppercase">Schedule Dispatch Date</label>
                <input
                  type="date"
                  value={newCampaign.scheduledDate}
                  onChange={e => setNewCampaign(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Email Content Body (HTML Supported)</label>
              <textarea
                placeholder="Write your email marketing copy here..."
                value={newCampaign.body}
                onChange={e => setNewCampaign(prev => ({ ...prev, body: e.target.value }))}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black h-40 resize-none font-mono"
                required
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E2E1DD] pt-3">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-xs text-[#8C9086] bg-[#FAF9F6] border border-[#E2E1DD] px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="text-xs text-black bg-[#E1FF4B] border border-[#C0D930] px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" /> Schedule Campaign
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns list and dashboards */}
      <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="border-b border-[#E2E1DD] pb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider">Newsletters Campaigns Ledger</h3>
          <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-2.5 py-0.5 rounded-full uppercase">
            {campaigns.length} campaigns logged
          </span>
        </div>

        <div className="space-y-4">
          {campaigns.map((c) => {
            const hasSent = c.status === 'Sent';
            const openRate = c.sentCount > 0 ? Math.round((c.opens / c.sentCount) * 100) : 0;
            const clickRate = c.opens > 0 ? Math.round((c.clicks / c.opens) * 100) : 0;

            return (
              <div 
                key={c.id} 
                className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-5 space-y-4 hover:border-[#8B5CF6]/30 transition-all flex flex-col justify-between"
              >
                {/* Campaign Header */}
                <div className="flex items-start justify-between border-b border-[#E2E1DD]/70 pb-2">
                  <div>
                    <h4 className="text-xs font-extrabold text-black leading-tight">{c.subject}</h4>
                    <p className="text-[9px] text-[#8C9086] font-bold mt-1 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" /> Recipient List: <code className="bg-white px-1.5 py-0.5 border border-[#E2E1DD] rounded text-black font-mono">{c.listName}</code>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-extrabold border px-2 py-0.5 rounded-full uppercase ${
                      c.status === 'Sent' 
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-700' 
                        : 'bg-amber-100 border-amber-300 text-amber-700'
                    }`}>
                      {c.status}
                    </span>
                    <button
                      onClick={() => deleteCampaign(c.id)}
                      className="text-[#8C9086] hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Campaign Content and Metrics split */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Copy preview */}
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[8px] text-[#8C9086] font-bold uppercase">Email Content Body</span>
                    <p className="text-xs text-[#5E6258] font-bold leading-relaxed line-clamp-3 bg-white border border-[#E2E1DD] p-3 rounded-lg italic">
                      "{c.body}"
                    </p>
                  </div>

                  {/* Metrics grid */}
                  <div className="bg-white border border-[#E2E1DD] p-4 rounded-xl space-y-2 text-xs text-[#5E6258] font-semibold flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-[#8C9086]" /> Sent Count</span>
                      <strong className="text-black font-black">{c.sentCount}</strong>
                    </div>
                    {hasSent ? (
                      <>
                        <div className="flex justify-between items-center border-t border-[#E2E1DD]/50 pt-1.5">
                          <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-[#8C9086]" /> Open Rate</span>
                          <strong className="text-[#8B5CF6] font-black">{openRate}% ({c.opens})</strong>
                        </div>
                        <div className="flex justify-between items-center border-t border-[#E2E1DD]/50 pt-1.5">
                          <span className="flex items-center gap-1"><Percent className="h-3.5 w-3.5 text-[#8C9086]" /> Click-to-Open</span>
                          <strong className="text-[#C0D930] font-black">{clickRate}% ({c.clicks})</strong>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center border-t border-[#E2E1DD]/50 pt-1.5">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-[#8C9086]" /> Dispatch Date</span>
                        <strong className="text-black font-black">{c.scheduledDate}</strong>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
