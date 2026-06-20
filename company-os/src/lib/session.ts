import { cookies } from 'next/headers';
import { getDB } from '@/lib/db';

export interface UserSession {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'employee' | 'manager' | 'admin';
  department: string;
  status: string;
}

const DEFAULT_USER: UserSession = {
  id: 'e0000000-0000-0000-0000-000000000001',
  email: 'nikhil@omnihub.com',
  first_name: 'Nikhil',
  last_name: 'Bhaviyavar',
  role: 'manager',
  department: 'HR',
  status: 'online',
};

/**
 * Server-side helper to read the mock session employee cookie.
 * Falls back to Nikhil (HR Manager) if not configured.
 */
export async function getCurrentUser(): Promise<UserSession> {
  const cookieStore = await cookies();
  const employeeId = cookieStore.get('employee_id')?.value;

  if (!employeeId) {
    return DEFAULT_USER;
  }

  try {
    const sql = getDB();
    const result = await sql`
      SELECT id, email, first_name, last_name, role, department, status
      FROM employees 
      WHERE id = ${employeeId} 
      LIMIT 1
    ` as any[];

    if (result.length > 0) {
      return result[0] as UserSession;
    }
  } catch (err) {
    console.error('Failed to query session user, running in fallback mode:', err);
  }

  return DEFAULT_USER;
}
