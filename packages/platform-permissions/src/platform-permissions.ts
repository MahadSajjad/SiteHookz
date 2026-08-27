export interface PermissionDefinition {
  key: string;
  description: string;
  category: string;
}

export const PLATFORM_PERMISSIONS: PermissionDefinition[] = [
  { key: 'platform.organization.read', description: 'Read organization details', category: 'Platform' },
  { key: 'platform.organization.update', description: 'Update organization details', category: 'Platform' },
  { key: 'platform.branches.read', description: 'Read branches', category: 'Platform' },
  { key: 'platform.branches.create', description: 'Create branch', category: 'Platform' },
  { key: 'platform.branches.update', description: 'Update branch', category: 'Platform' },
  { key: 'platform.branches.archive', description: 'Archive branch', category: 'Platform' },
  { key: 'platform.branches.restore', description: 'Restore branch', category: 'Platform' },
  { key: 'platform.memberships.read', description: 'Read memberships', category: 'Platform' },
  { key: 'platform.memberships.invite', description: 'Invite members', category: 'Platform' },
  { key: 'platform.memberships.update', description: 'Update members', category: 'Platform' },
  { key: 'platform.memberships.suspend', description: 'Suspend members', category: 'Platform' },
  { key: 'platform.memberships.remove', description: 'Remove members', category: 'Platform' },
  { key: 'platform.roles.read', description: 'Read roles', category: 'Platform' },
  { key: 'platform.roles.create', description: 'Create roles', category: 'Platform' },
  { key: 'platform.roles.update', description: 'Update roles', category: 'Platform' },
  { key: 'platform.roles.delete', description: 'Delete roles', category: 'Platform' },
  { key: 'platform.roles.assign', description: 'Assign roles', category: 'Platform' },
  { key: 'platform.permissions.read', description: 'Read permissions', category: 'Platform' },
  { key: 'platform.invitations.read', description: 'Read invitations', category: 'Platform' },
  { key: 'platform.invitations.create', description: 'Create invitations', category: 'Platform' },
  { key: 'platform.invitations.revoke', description: 'Revoke invitations', category: 'Platform' },
];
