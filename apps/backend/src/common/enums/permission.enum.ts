export enum Permission {
  // Users
  USERS_READ = 'users:read',
  USERS_CREATE = 'users:create',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',

  // Placeholder for future modules
  // TRANSACTIONS_READ = 'transactions:read',
  // TRANSACTIONS_CREATE = 'transactions:create',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(Permission),
  user: [Permission.USERS_READ],
};
