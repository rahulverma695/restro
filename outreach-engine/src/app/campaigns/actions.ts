'use server';

import { getDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createCampaign(name: string, leadListId: string) {
  try {
    const sql = getDB();
    await sql`
      INSERT INTO outbound_campaigns (name, lead_list_id, is_active)
      VALUES (${name}, ${leadListId || null}, false)
    `;
    revalidatePath('/campaigns');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to create campaign:', err);
    return { success: false, error: err.message };
  }
}

export async function toggleCampaign(id: string, isActive: boolean) {
  try {
    const sql = getDB();
    await sql`
      UPDATE outbound_campaigns 
      SET is_active = ${isActive} 
      WHERE id = ${id}
    `;
    revalidatePath('/campaigns');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to toggle campaign status:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteCampaign(id: string) {
  try {
    const sql = getDB();
    await sql`DELETE FROM outbound_campaigns WHERE id = ${id}`;
    revalidatePath('/campaigns');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete campaign:', err);
    return { success: false, error: err.message };
  }
}

export async function saveSequenceStep(
  campaignId: string,
  stepNumber: number,
  delayDays: number,
  subject: string,
  body: string
) {
  try {
    const sql = getDB();
    await sql`
      INSERT INTO sequence_steps (campaign_id, step_number, delay_days, subject_template, body_template)
      VALUES (${campaignId}, ${stepNumber}, ${delayDays}, ${subject}, ${body})
      ON CONFLICT (campaign_id, step_number) DO UPDATE
      SET delay_days = EXCLUDED.delay_days, 
          subject_template = EXCLUDED.subject_template, 
          body_template = EXCLUDED.body_template
    `;
    revalidatePath('/campaigns');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to save sequence step:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteSequenceStep(stepId: string) {
  try {
    const sql = getDB();
    await sql`DELETE FROM sequence_steps WHERE id = ${stepId}`;
    revalidatePath('/campaigns');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete sequence step:', err);
    return { success: false, error: err.message };
  }
}

export async function uploadLeadList(
  listName: string,
  leads: Array<{
    email: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
    website?: string;
  }>
) {
  try {
    const sql = getDB();
    
    // 1. Create Lead List
    const listResult = await sql`
      INSERT INTO lead_lists (name)
      VALUES (${listName})
      RETURNING id
    ` as any[];
    const listId = listResult[0]?.id;

    if (!listId) {
      throw new Error('Failed to create lead list header');
    }

    // 2. Batch Insert Leads
    // To prevent query complexity in serverless, we loop and insert. For standard list sizes (100-500) this takes under 1-2 seconds.
    for (const lead of leads) {
      if (!lead.email) continue;
      await sql`
        INSERT INTO leads (lead_list_id, email, first_name, last_name, company_name, website, status)
        VALUES (${listId}, ${lead.email}, ${lead.first_name || null}, ${lead.last_name || null}, ${lead.company_name || null}, ${lead.website || null}, 'uncontacted')
        ON CONFLICT (lead_list_id, email) DO NOTHING
      `;
    }

    revalidatePath('/campaigns');
    return { success: true, listId };
  } catch (err: any) {
    console.error('Failed to upload lead list:', err);
    return { success: false, error: err.message };
  }
}
