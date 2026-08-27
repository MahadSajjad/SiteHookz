export const P = {
  PLATFORM: {
    ORGANIZATION: {
      READ: 'platform.organization.read',
      UPDATE: 'platform.organization.update',
    },
    BRANCHES: {
      READ: 'platform.branches.read',
      CREATE: 'platform.branches.create',
      UPDATE: 'platform.branches.update',
      ARCHIVE: 'platform.branches.archive',
      RESTORE: 'platform.branches.restore',
    },
    MEMBERSHIPS: {
      READ: 'platform.memberships.read',
      INVITE: 'platform.memberships.invite',
      UPDATE: 'platform.memberships.update',
      SUSPEND: 'platform.memberships.suspend',
      REMOVE: 'platform.memberships.remove',
    },
    ROLES: {
      READ: 'platform.roles.read',
      CREATE: 'platform.roles.create',
      UPDATE: 'platform.roles.update',
      DELETE: 'platform.roles.delete',
      ASSIGN: 'platform.roles.assign',
    },
    PERMISSIONS: {
      READ: 'platform.permissions.read',
    },
    INVITATIONS: {
      READ: 'platform.invitations.read',
      CREATE: 'platform.invitations.create',
      REVOKE: 'platform.invitations.revoke',
    },
  },
  EDUCATION: {
    ACADEMIC_SESSIONS: {
      READ: 'education.academic_sessions.read',
      CREATE: 'education.academic_sessions.create',
      UPDATE: 'education.academic_sessions.update',
      ARCHIVE: 'education.academic_sessions.archive',
    },
  },
} as const;
