// Role-based access control configuration
export type UserRole = 'admin' | 'manager' | 'sales' | 'distributor' | 'beneficiary' | 'logger';

export const ROLE_PERMISSIONS = {
  dashboard: ['admin', 'manager', 'sales', 'distributor', 'beneficiary', 'logger'] as UserRole[],
  health: ['beneficiary', 'admin', 'manager', 'distributor', 'logger'] as UserRole[],
  management: ['admin', 'manager', 'distributor'] as UserRole[],
  notifications: ['admin', 'manager', 'sales', 'distributor', 'beneficiary', 'logger'] as UserRole[],
  profile: ['admin', 'manager', 'sales', 'distributor', 'beneficiary', 'logger'] as UserRole[],
} as const;

export const PAGE_PERMISSIONS = {
  'cycle-page': ['beneficiary', 'admin', 'manager', 'distributor', 'logger'] as UserRole[],
  'distribution-page': ['admin', 'manager', 'distributor'] as UserRole[],
  'expenses-page': ['admin', 'manager', 'sales'] as UserRole[],
  'messaging-page': ['admin', 'manager', 'distributor', 'beneficiary'] as UserRole[],
  'reports-page': ['admin', 'manager', 'sales'] as UserRole[],
  'admin-page': ['admin', 'manager'] as UserRole[],
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
