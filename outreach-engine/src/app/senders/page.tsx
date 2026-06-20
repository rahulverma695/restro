import { getDB } from '@/lib/db';
import { checkDomainDNS, DNSReport } from '@/lib/dns';
import { revalidatePath } from 'next/cache';
import { 
  ShieldCheck, 
  Mail, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface InboxRow {
  id: string;
  email: string;
  provider: string;
  daily_limit: number;
  sent_today_count: number;
  status: string;
}

// Server Action to Add Inbox
async function addInboxAction(formData: FormData) {
  'use server';
  const email = formData.get('email') as string;
  const provider = formData.get('provider') as string;
  const token = formData.get('token') as string;

  if (!email || !provider) return;

  try {
    const sql = getDB();
    await sql`
      INSERT INTO sender_inboxes (email, provider, oauth_refresh_token, daily_limit, status)
      VALUES (${email}, ${provider}, ${token || 'dummy_token'}, 30, 'active')
      ON CONFLICT (email) DO UPDATE 
      SET provider = EXCLUDED.provider, oauth_refresh_token = EXCLUDED.oauth_refresh_token, status = 'active';
    `;
    revalidatePath('/senders');
  } catch (err) {
    console.error('Failed to add inbox, ensure schema is initialized:', err);
  }
}

// Server Action to Delete Inbox
async function deleteInboxAction(id: string) {
  'use server';
  try {
    const sql = getDB();
    await sql`DELETE FROM sender_inboxes WHERE id = ${id}`;
    revalidatePath('/senders');
  } catch (err) {
    console.error('Failed to delete inbox:', err);
  }
}

// Server Action to Audit DNS
async function runDNSAuditAction(domain: string, selector?: string) {
  'use server';
  if (!domain) return null;
  try {
    return await checkDomainDNS(domain, selector || 'google');
  } catch (err) {
    console.error('DNS Check error:', err);
    return null;
  }
}

export default async function SendersPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; selector?: string }>;
}) {
  const params = await searchParams;
  const auditDomain = params.domain || '';
  const auditSelector = params.selector || 'google';
  
  let inboxes: InboxRow[] = [];
  let dbAvailable = true;

  // Query inboxes
  try {
    const sql = getDB();
    const rows = await sql`
      SELECT id, email, provider, daily_limit, sent_today_count, status 
      FROM sender_inboxes 
      ORDER BY email ASC
    `;
    inboxes = rows as unknown as InboxRow[];
  } catch (err) {
    dbAvailable = false;
  }

  // Run audit if domain provided
  let dnsReport: DNSReport | null = null;
  if (auditDomain) {
    dnsReport = await runDNSAuditAction(auditDomain, auditSelector);
  }

  // List unique domains from connected inboxes
  const domains = Array.from(new Set(inboxes.map(i => i.email.split('@')[1]).filter(Boolean)));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Senders & DNS Authenticator</h2>
        <p className="text-sm text-[#94A3B8]">Manage your sending accounts, authorize API tokens, and audit deliverability security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Add Sender & Active Inboxes */}
        <div className="lg:col-span-2 space-y-8">
          {/* Add Sender Form */}
          <div className="bg-[#090D1A] border border-[#1E293B] rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Connect Outreach Inbox</h3>
              <p className="text-xs text-[#94A3B8]">Connect Google Workspace or Office 365 accounts via OAuth tokens.</p>
            </div>

            <form action={addInboxAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-[#94A3B8]" htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  id="email"
                  required
                  placeholder="e.g. sales@getyourcompany.com" 
                  className="w-full bg-[#030712] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]" htmlFor="provider">Email Provider</label>
                <select 
                  name="provider" 
                  id="provider"
                  className="w-full bg-[#030712] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors"
                >
                  <option value="gmail">Google Workspace (Gmail)</option>
                  <option value="outlook">Microsoft 365 (Outlook)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]" htmlFor="token">OAuth Refresh Token (Optional)</label>
                <input 
                  type="password" 
                  name="token"
                  id="token"
                  placeholder="Paste refresh token or leave blank for dummy" 
                  className="w-full bg-[#030712] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button 
                  type="submit"
                  disabled={!dbAvailable}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-sm font-semibold text-white rounded-xl hover:from-[#4F46E5] hover:to-[#7C3AED] transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" /> Link Connected Inbox
                </button>
              </div>
            </form>
          </div>

          {/* Active Sender Pool Table */}
          <div className="bg-[#090D1A] border border-[#1E293B] rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Active Sender Pool</h3>
            
            {!dbAvailable ? (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Database schema is not initialized. Connect Neon and run migration first to list active inboxes.</span>
              </div>
            ) : inboxes.length === 0 ? (
              <div className="text-center py-8 text-sm text-[#475569]">
                <Mail className="h-8 w-8 mx-auto mb-2 text-[#1E293B]" />
                <p>No inboxes connected yet. Add your first sending domain above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-xs font-semibold uppercase tracking-wider text-[#475569]">
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Provider</th>
                      <th className="py-3 px-4">Limits</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/40 text-sm">
                    {inboxes.map((inbox) => (
                      <tr key={inbox.id} className="hover:bg-[#1E293B]/10">
                        <td className="py-3.5 px-4 font-medium text-white">{inbox.email}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inbox.provider === 'gmail' 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {inbox.provider}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#94A3B8]">
                          {inbox.sent_today_count} / {inbox.daily_limit} today
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${inbox.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            <span className="text-xs capitalize text-[#E2E8F0]">{inbox.status}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <form action={deleteInboxAction.bind(null, inbox.id)}>
                            <button type="submit" className="text-[#475569] hover:text-rose-400 transition-colors p-1">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: DNS Audits */}
        <div className="space-y-6">
          <div className="bg-[#090D1A] border border-[#1E293B] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 text-[#6366F1]">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-lg font-bold text-white">DNS Records Audit</h3>
            </div>
            
            <p className="text-xs text-[#94A3B8]">
              Verify your sending domains comply with SPF, DKIM, and DMARC rules. Missing configurations trigger high spam filters.
            </p>

            <form method="GET" className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]">Select Connected Domain</label>
                <select 
                  name="domain" 
                  defaultValue={auditDomain}
                  className="w-full bg-[#030712] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors"
                >
                  <option value="">-- Choose Domain --</option>
                  {domains.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                  {domains.length === 0 && (
                    <option value="testcompany.com">testcompany.com (Demo)</option>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]">DKIM Selector</label>
                <input 
                  type="text" 
                  name="selector"
                  defaultValue={auditSelector}
                  placeholder="e.g. google, sig1" 
                  className="w-full bg-[#030712] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors"
                />
              </div>

              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E293B] border border-[#2E3C51] text-xs font-semibold text-white rounded-xl hover:bg-[#2E3C51] transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Query DNS Records
              </button>
            </form>

            {/* Audit Results */}
            {dnsReport && (
              <div className="space-y-4 pt-4 border-t border-[#1E293B]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verification Results for {auditDomain}</h4>
                
                {/* SPF */}
                <div className="space-y-1 bg-[#030712] p-3 rounded-xl border border-[#1E293B]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">SPF (Sender Policy Framework)</span>
                    {dnsReport.spf.valid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-[#475569] font-mono break-all mt-1">
                    {dnsReport.spf.record || dnsReport.spf.error || 'No record resolved'}
                  </p>
                </div>

                {/* DMARC */}
                <div className="space-y-1 bg-[#030712] p-3 rounded-xl border border-[#1E293B]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">DMARC policy</span>
                    {dnsReport.dmarc.valid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-[#475569] font-mono break-all mt-1">
                    {dnsReport.dmarc.record || dnsReport.dmarc.error || 'No record resolved'}
                  </p>
                </div>

                {/* MX */}
                <div className="space-y-1 bg-[#030712] p-3 rounded-xl border border-[#1E293B]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">MX Mail Servers</span>
                    {dnsReport.mx.valid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-400" />
                    )}
                  </div>
                  <ul className="text-[10px] text-[#475569] list-disc list-inside mt-1 font-mono">
                    {dnsReport.mx.records.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                    {dnsReport.mx.records.length === 0 && (
                      <span className="text-rose-400">{dnsReport.mx.error}</span>
                    )}
                  </ul>
                </div>

                {/* DKIM */}
                {dnsReport.dkim && (
                  <div className="space-y-1 bg-[#030712] p-3 rounded-xl border border-[#1E293B]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">DKIM (Selector: {auditSelector})</span>
                      {dnsReport.dkim.valid ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-[#475569] font-mono break-all mt-1">
                      {dnsReport.dkim.record || dnsReport.dkim.error || 'No record resolved'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
