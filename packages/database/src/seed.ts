import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  // Platform - Organization
  { key: 'platform.organization.read', description: 'Read organization details', category: 'Platform' },
  { key: 'platform.organization.update', description: 'Update organization details', category: 'Platform' },
  // Platform - Branches
  { key: 'platform.branches.read', description: 'Read branches', category: 'Platform' },
  { key: 'platform.branches.create', description: 'Create branch', category: 'Platform' },
  { key: 'platform.branches.update', description: 'Update branch', category: 'Platform' },
  { key: 'platform.branches.archive', description: 'Archive branch', category: 'Platform' },
  { key: 'platform.branches.restore', description: 'Restore branch', category: 'Platform' },
  // Platform - Memberships
  { key: 'platform.memberships.read', description: 'Read memberships', category: 'Platform' },
  { key: 'platform.memberships.invite', description: 'Invite members', category: 'Platform' },
  { key: 'platform.memberships.update', description: 'Update members', category: 'Platform' },
  { key: 'platform.memberships.suspend', description: 'Suspend members', category: 'Platform' },
  { key: 'platform.memberships.remove', description: 'Remove members', category: 'Platform' },
  // Platform - Roles
  { key: 'platform.roles.read', description: 'Read roles', category: 'Platform' },
  { key: 'platform.roles.create', description: 'Create roles', category: 'Platform' },
  { key: 'platform.roles.update', description: 'Update roles', category: 'Platform' },
  { key: 'platform.roles.delete', description: 'Delete roles', category: 'Platform' },
  { key: 'platform.roles.assign', description: 'Assign roles', category: 'Platform' },
  // Platform - Permissions
  { key: 'platform.permissions.read', description: 'Read permissions', category: 'Platform' },
  // Platform - Invitations
  { key: 'platform.invitations.read', description: 'Read invitations', category: 'Platform' },
  { key: 'platform.invitations.create', description: 'Create invitations', category: 'Platform' },
  { key: 'platform.invitations.revoke', description: 'Revoke invitations', category: 'Platform' },
  // Education
  { key: 'education.academic_sessions.read', description: 'Read academic sessions', category: 'Education' },
  { key: 'education.academic_sessions.create', description: 'Create academic sessions', category: 'Education' },
  { key: 'education.academic_sessions.update', description: 'Update academic sessions', category: 'Education' },
  { key: 'education.academic_sessions.archive', description: 'Archive academic sessions', category: 'Education' },
];

async function main() {
  console.log('Seeding permissions...');
  
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description, category: perm.category },
      create: perm,
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
