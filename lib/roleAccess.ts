// Role-based access control configuration
export type UserRole = 'super_admin' | 'admin' | 'distributor' | 'beneficiary' | 'viewer';

export const ROLE_PERMISSIONS = {
  dashboard: ['super_admin', 'admin', 'distributor', 'beneficiary', 'viewer'] as UserRole[],
  health: ['beneficiary', 'admin', 'super_admin', 'distributor'] as UserRole[],
  management: ['super_admin', 'admin', 'distributor'] as UserRole[],
  notifications: ['super_admin', 'admin', 'distributor', 'beneficiary', 'viewer'] as UserRole[],
  profile: ['super_admin', 'admin', 'distributor', 'beneficiary', 'viewer'] as UserRole[],
} as const;

export const PAGE_PERMISSIONS = {
  'cycle-page': ['beneficiary', 'admin', 'super_admin', 'distributor'] as UserRole[],
  'distribution-page': ['admin', 'super_admin', 'distributor'] as UserRole[],
  'expenses-page': ['admin', 'super_admin'] as UserRole[],
  'messaging-page': ['admin', 'super_admin', 'distributor', 'beneficiary'] as UserRole[],
  'reports-page': ['admin', 'super_admin', 'viewer'] as UserRole[],
  'admin-page': ['admin', 'super_admin'] as UserRole[],
} as const;

export function canAccessStack(stackId: string, role: UserRole): boolean {
  const key = stackId.replace('-stack', '') as keyof typeof ROLE_PERMISSIONS;
  return ROLE_PERMISSIONS[key]?.includes(role) ?? false;
}

export function canAccessPage(pageId: string, role: UserRole): boolean {
  return PAGE_PERMISSIONS[pageId as keyof typeof PAGE_PERMISSIONS]?.includes(role) ?? false;
}

export function getAccessibleStacks(role: UserRole): string[] {
  return Object.entries(ROLE_PERMISSIONS)
    .filter(([_, roles]) => roles.includes(role))
    .map(([stack]) => `${stack}-stack`);
}
