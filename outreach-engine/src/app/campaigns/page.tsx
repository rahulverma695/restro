import { getDB } from '@/lib/db';
import CampaignManager from '@/components/CampaignManager';

interface CampaignRow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  list_name: string;
  lead_count: number;
  lead_list_id: string | null;
}

interface LeadListRow {
  id: string;
  name: string;
  lead_count: number;
}

interface StepRow {
  id: string;
  campaign_id: string;
  step_number: number;
  delay_days: number;
  subject_template: string;
  body_template: string;
}

async function getCampaignData() {
  try {
    const sql = getDB();

    // Check if tables exist by doing a basic count query
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'outbound_campaigns'
      );
    ` as any[];

    if (!tableCheck[0]?.exists) {
      return { campaigns: [], leadLists: [], sequenceSteps: [], schemaMissing: true };
    }

    // Run parallel fetch queries
    const [campaignsResult, leadListsResult, stepsResult] = await Promise.all([
      sql`
        SELECT 
          c.id, 
          c.name, 
          c.is_active, 
          c.created_at, 
          c.lead_list_id,
          l.name as list_name, 
          COALESCE((SELECT COUNT(*)::int FROM leads WHERE lead_list_id = c.lead_list_id), 0) as lead_count 
        FROM outbound_campaigns c 
        LEFT JOIN lead_lists l ON c.lead_list_id = l.id
        ORDER BY c.created_at DESC
      ` as any,
      sql`
        SELECT 
          id, 
          name, 
          COALESCE((SELECT COUNT(*)::int FROM leads WHERE lead_list_id = id), 0) as lead_count 
        FROM lead_lists
        ORDER BY created_at DESC
      ` as any,
      sql`
        SELECT 
          id, 
          campaign_id, 
          step_number, 
          delay_days, 
          subject_template, 
          body_template 
        FROM sequence_steps 
        ORDER BY campaign_id, step_number ASC
      ` as any
    ]);

    // Map serialised dates to strings for Next.js boundary transition
    const campaigns = (campaignsResult as any[]).map((c: any) => ({
      ...c,
      created_at: new Date(c.created_at).toLocaleDateString()
    })) as unknown as CampaignRow[];

    const leadLists = leadListsResult as unknown as LeadListRow[];
    const sequenceSteps = stepsResult as unknown as StepRow[];

    return { campaigns, leadLists, sequenceSteps, schemaMissing: false };

  } catch (err) {
    console.error('Failed to query campaigns database:', err);
    return { campaigns: [], leadLists: [], sequenceSteps: [], schemaMissing: true };
  }
}

export default async function CampaignsPage() {
  const { campaigns, leadLists, sequenceSteps, schemaMissing } = await getCampaignData();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Info */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">Campaign Sequences</h2>
        <p className="text-sm text-[#94A3B8]">Upload lists, configure email templates, and automate message spacing.</p>
      </div>

      {schemaMissing && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
          <h3 className="font-semibold text-white">Database Migration Required</h3>
          <p className="text-xs text-[#94A3B8] mt-1">
            To create campaigns and upload lists, run the SQL script in <code className="bg-[#1E293B] px-1 rounded text-amber-300">src/lib/schema.sql</code> in your Neon database client first.
          </p>
        </div>
      )}

      {/* Main Campaign Manager Core */}
      <CampaignManager 
        campaigns={campaigns} 
        leadLists={leadLists} 
        sequenceSteps={sequenceSteps} 
      />
    </div>
  );
}
