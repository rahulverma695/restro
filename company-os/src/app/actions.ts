'use server';

import { getDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// ==========================================
// 1. SHIFT / CLOCK ACTIONS
// ==========================================

export async function clockIn(employeeId: string, notes?: string) {
  try {
    const sql = getDB();
    
    // Check if employee already has an active shift
    const activeShift = await sql`
      SELECT id FROM shifts 
      WHERE employee_id = ${employeeId} AND clock_out IS NULL 
      LIMIT 1
    ` as any[];

    if (activeShift.length > 0) {
      throw new Error('You are already clocked in.');
    }

    // Insert new shift
    await sql`
      INSERT INTO shifts (employee_id, clock_in, notes)
      VALUES (${employeeId}, CURRENT_TIMESTAMP, ${notes || null})
    `;

    // Update employee status to 'online'
    await sql`
      UPDATE employees 
      SET status = 'online' 
      WHERE id = ${employeeId}
    `;

    revalidatePath('/');
    revalidatePath('/leaves');
    return { success: true };
  } catch (err: any) {
    console.error('Clock-in error:', err);
    return { success: false, error: err.message };
  }
}

export async function clockOut(employeeId: string, notes?: string) {
  try {
    const sql = getDB();

    // Find the active shift
    const activeShift = await sql`
      SELECT id FROM shifts 
      WHERE employee_id = ${employeeId} AND clock_out IS NULL 
      LIMIT 1
    ` as any[];

    if (activeShift.length === 0) {
      throw new Error('No active shift found to clock out of.');
    }

    const shiftId = activeShift[0].id;

    // Update shift with clock out time
    await sql`
      UPDATE shifts 
      SET clock_out = CURRENT_TIMESTAMP, notes = COALESCE(${notes || null}, notes)
      WHERE id = ${shiftId}
    `;

    // Update employee status to 'offline'
    await sql`
      UPDATE employees 
      SET status = 'offline' 
      WHERE id = ${employeeId}
    `;

    revalidatePath('/');
    revalidatePath('/leaves');
    return { success: true };
  } catch (err: any) {
    console.error('Clock-out error:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 2. LEAVE ACTIONS
// ==========================================

export async function requestLeave(
  employeeId: string, 
  leaveType: string, 
  startDate: string, 
  endDate: string, 
  reason: string
) {
  try {
    const sql = getDB();

    await sql`
      INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
      VALUES (${employeeId}, ${leaveType}, ${startDate}, ${endDate}, ${reason}, 'pending')
    `;

    revalidatePath('/leaves');
    return { success: true };
  } catch (err: any) {
    console.error('Leave request error:', err);
    return { success: false, error: err.message };
  }
}

export async function updateLeaveStatus(
  leaveId: string, 
  status: 'approved' | 'rejected', 
  approvedBy: string
) {
  try {
    const sql = getDB();

    // Update leave request
    const result = await sql`
      UPDATE leave_requests 
      SET status = ${status}, approved_by = ${approvedBy}
      WHERE id = ${leaveId}
      RETURNING employee_id, start_date, end_date
    ` as any[];

    if (result.length > 0 && status === 'approved') {
      const { employee_id, start_date, end_date } = result[0];
      const today = new Date().toISOString().split('T')[0];
      const start = new Date(start_date).toISOString().split('T')[0];
      const end = new Date(end_date).toISOString().split('T')[0];

      // If approved leave spans today, set status to 'on_leave'
      if (today >= start && today <= end) {
        await sql`
          UPDATE employees 
          SET status = 'on_leave' 
          WHERE id = ${employee_id}
        `;
      }
    }

    revalidatePath('/');
    revalidatePath('/leaves');
    revalidatePath('/directory');
    return { success: true };
  } catch (err: any) {
    console.error('Leave status update error:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 3. TICKET ACTIONS (HELPDESK)
// ==========================================

export async function createTicket(
  creatorId: string, 
  category: string, 
  title: string, 
  description: string, 
  priority: string
) {
  try {
    const sql = getDB();

    await sql`
      INSERT INTO tickets (creator_id, category, title, description, priority, status)
      VALUES (${creatorId}, ${category}, ${title}, ${description}, ${priority}, 'open')
    `;

    revalidatePath('/helpdesk');
    return { success: true };
  } catch (err: any) {
    console.error('Create ticket error:', err);
    return { success: false, error: err.message };
  }
}

export async function updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'resolved') {
  try {
    const sql = getDB();

    await sql`
      UPDATE tickets 
      SET status = ${status} 
      WHERE id = ${ticketId}
    `;

    revalidatePath('/helpdesk');
    return { success: true };
  } catch (err: any) {
    console.error('Update ticket status error:', err);
    return { success: false, error: err.message };
  }
}

export async function assignTicket(ticketId: string, assignedId: string) {
  try {
    const sql = getDB();

    await sql`
      UPDATE tickets 
      SET assigned_id = ${assignedId || null} 
      WHERE id = ${ticketId}
    `;

    revalidatePath('/helpdesk');
    return { success: true };
  } catch (err: any) {
    console.error('Assign ticket error:', err);
    return { success: false, error: err.message };
  }
}

export async function submitTicketReply(ticketId: string, senderId: string, message: string) {
  try {
    const sql = getDB();

    await sql`
      INSERT INTO ticket_replies (ticket_id, sender_id, message)
      VALUES (${ticketId}, ${senderId}, ${message})
    `;

    revalidatePath('/helpdesk');
    return { success: true };
  } catch (err: any) {
    console.error('Ticket reply error:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 4. WIKI ACTIONS
// ==========================================

export async function saveWikiDoc(title: string, content: string, createdBy: string, docId?: string) {
  try {
    const sql = getDB();

    if (docId) {
      await sql`
        UPDATE wiki_docs 
        SET title = ${title}, content = ${content}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${docId}
      `;
    } else {
      await sql`
        INSERT INTO wiki_docs (title, content, created_by)
        VALUES (${title}, ${content}, ${createdBy})
      `;
    }

    revalidatePath('/wiki');
    return { success: true };
  } catch (err: any) {
    console.error('Save wiki error:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteWikiDoc(docId: string) {
  try {
    const sql = getDB();

    await sql`
      DELETE FROM wiki_docs WHERE id = ${docId}
    `;

    revalidatePath('/wiki');
    return { success: true };
  } catch (err: any) {
    console.error('Delete wiki error:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 5. ANNOUNCEMENT ACTIONS
// ==========================================

export async function postAnnouncement(title: string, content: string, createdBy: string) {
  try {
    const sql = getDB();

    await sql`
      INSERT INTO announcements (title, content, created_by)
      VALUES (${title}, ${content}, ${createdBy})
    `;

    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Post announcement error:', err);
    return { success: false, error: err.message };
  }
}
