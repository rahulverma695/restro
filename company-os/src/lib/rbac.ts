export type UserRole = 'SuperAdmin' | 'HRAdmin' | 'Manager' | 'Employee';

export type SuiteName = 
  | 'hr' 
  | 'finance' 
  | 'it' 
  | 'comms' 
  | 'project' 
  | 'performance' 
  | 'facility' 
  | 'onboarding' 
  | 'vault' 
  | 'admin'
  | 'sales'
  | 'touchpoints'
  | 'marketing'
  | 'growth'
  | 'media';

// Permissions matrix defining which roles can view which suites
export const suitePermissions: Record<UserRole, SuiteName[]> = {
  SuperAdmin: ['hr', 'finance', 'it', 'comms', 'project', 'performance', 'facility', 'onboarding', 'vault', 'admin', 'sales', 'touchpoints', 'marketing', 'growth', 'media'],
  HRAdmin: ['hr', 'comms', 'project', 'performance', 'onboarding', 'facility', 'vault', 'sales', 'touchpoints', 'marketing', 'growth', 'media'],
  Manager: ['hr', 'finance', 'it', 'comms', 'project', 'performance', 'facility', 'vault', 'sales', 'touchpoints', 'marketing', 'growth', 'media'],
  Employee: ['hr', 'finance', 'it', 'comms', 'project', 'facility', 'vault', 'sales', 'touchpoints', 'marketing', 'growth', 'media'],
};

/**
 * Checks if a specific role has permission to access a suite.
 */
export function hasSuiteAccess(role: UserRole, suite: SuiteName): boolean {
  return suitePermissions[role]?.includes(suite) ?? false;
}

export interface PermissionDetails {
  canApproveLeaves: boolean;
  canAssignTickets: boolean;
  canDeleteWiki: boolean;
  canViewLedger: boolean;
  canManageRBAC: boolean;
}

/**
 * Returns specific action-level capabilities based on user role.
 */
export function getActionPermissions(role: UserRole): PermissionDetails {
  return {
    canApproveLeaves: role === 'SuperAdmin' || role === 'HRAdmin' || role === 'Manager',
    canAssignTickets: role === 'SuperAdmin' || role === 'Manager',
    canDeleteWiki: role === 'SuperAdmin' || role === 'HRAdmin' || role === 'Manager',
    canViewLedger: role === 'SuperAdmin',
    canManageRBAC: role === 'SuperAdmin',
  };
}
