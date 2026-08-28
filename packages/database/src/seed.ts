import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const permissions = [
  // Education People - Students
  {
    key: "education.students.read",
    description: "Read students",
    category: "Education",
  },
  {
    key: "education.students.create",
    description: "Create students",
    category: "Education",
  },
  {
    key: "education.students.update",
    description: "Update students",
    category: "Education",
  },
  {
    key: "education.students.archive",
    description: "Archive students",
    category: "Education",
  },
  {
    key: "education.students.restore",
    description: "Restore students",
    category: "Education",
  },
  // Education People - Guardians
  {
    key: "education.guardians.read",
    description: "Read guardians",
    category: "Education",
  },
  {
    key: "education.guardians.create",
    description: "Create guardians",
    category: "Education",
  },
  {
    key: "education.guardians.update",
    description: "Update guardians",
    category: "Education",
  },
  {
    key: "education.guardians.archive",
    description: "Archive guardians",
    category: "Education",
  },
  {
    key: "education.guardians.restore",
    description: "Restore guardians",
    category: "Education",
  },
  // Education People - StudentGuardians
  {
    key: "education.student_guardians.read",
    description: "Read student-guardian links",
    category: "Education",
  },
  {
    key: "education.student_guardians.manage",
    description: "Manage student-guardian links",
    category: "Education",
  },
  // Education People - Staff
  {
    key: "education.staff.read",
    description: "Read staff",
    category: "Education",
  },
  {
    key: "education.staff.create",
    description: "Create staff",
    category: "Education",
  },
  {
    key: "education.staff.update",
    description: "Update staff",
    category: "Education",
  },
  {
    key: "education.staff.archive",
    description: "Archive staff",
    category: "Education",
  },
  {
    key: "education.staff.restore",
    description: "Restore staff",
    category: "Education",
  },
  // Education People - Positions
  {
    key: "education.staff_positions.read",
    description: "Read staff positions",
    category: "Education",
  },
  {
    key: "education.staff_positions.create",
    description: "Create staff positions",
    category: "Education",
  },
  {
    key: "education.staff_positions.update",
    description: "Update staff positions",
    category: "Education",
  },
  {
    key: "education.staff_positions.archive",
    description: "Archive staff positions",
    category: "Education",
  },
  // Education People - Assignments
  {
    key: "education.staff_assignments.read",
    description: "Read staff assignments",
    category: "Education",
  },
  {
    key: "education.staff_assignments.create",
    description: "Create staff assignments",
    category: "Education",
  },
  {
    key: "education.staff_assignments.update",
    description: "Update staff assignments",
    category: "Education",
  },
  {
    key: "education.staff_assignments.end",
    description: "End staff assignments",
    category: "Education",
  },

  // Platform - Organization
  {
    key: "platform.organization.read",
    description: "Read organization details",
    category: "Platform",
  },
  {
    key: "platform.organization.update",
    description: "Update organization details",
    category: "Platform",
  },
  // Platform - Branches
  {
    key: "platform.branches.read",
    description: "Read branches",
    category: "Platform",
  },
  {
    key: "platform.branches.create",
    description: "Create branch",
    category: "Platform",
  },
  {
    key: "platform.branches.update",
    description: "Update branch",
    category: "Platform",
  },
  {
    key: "platform.branches.archive",
    description: "Archive branch",
    category: "Platform",
  },
  {
    key: "platform.branches.restore",
    description: "Restore branch",
    category: "Platform",
  },
  // Platform - Memberships
  {
    key: "platform.memberships.read",
    description: "Read memberships",
    category: "Platform",
  },
  {
    key: "platform.memberships.invite",
    description: "Invite members",
    category: "Platform",
  },
  {
    key: "platform.memberships.update",
    description: "Update members",
    category: "Platform",
  },
  {
    key: "platform.memberships.suspend",
    description: "Suspend members",
    category: "Platform",
  },
  {
    key: "platform.memberships.remove",
    description: "Remove members",
    category: "Platform",
  },
  // Platform - Roles
  {
    key: "platform.roles.read",
    description: "Read roles",
    category: "Platform",
  },
  {
    key: "platform.roles.create",
    description: "Create roles",
    category: "Platform",
  },
  {
    key: "platform.roles.update",
    description: "Update roles",
    category: "Platform",
  },
  {
    key: "platform.roles.delete",
    description: "Delete roles",
    category: "Platform",
  },
  {
    key: "platform.roles.assign",
    description: "Assign roles",
    category: "Platform",
  },
  // Platform - Permissions
  {
    key: "platform.permissions.read",
    description: "Read permissions",
    category: "Platform",
  },
  // Platform - Invitations
  {
    key: "platform.invitations.read",
    description: "Read invitations",
    category: "Platform",
  },
  {
    key: "platform.invitations.create",
    description: "Create invitations",
    category: "Platform",
  },
  {
    key: "platform.invitations.revoke",
    description: "Revoke invitations",
    category: "Platform",
  },
  // Education
  {
    key: "education.academic_sessions.read",
    description: "Read academic sessions",
    category: "Education",
  },
  {
    key: "education.academic_sessions.create",
    description: "Create academic sessions",
    category: "Education",
  },
  {
    key: "education.academic_sessions.update",
    description: "Update academic sessions",
    category: "Education",
  },
  {
    key: "education.academic_sessions.archive",
    description: "Archive academic sessions",
    category: "Education",
  },

  // Education Layer 3C
  {
    key: "education.subjects.read",
    description: "Read subjects",
    category: "Education",
  },
  {
    key: "education.subjects.create",
    description: "Create subjects",
    category: "Education",
  },
  {
    key: "education.subjects.update",
    description: "Update subjects",
    category: "Education",
  },
  {
    key: "education.subjects.archive",
    description: "Archive subjects",
    category: "Education",
  },
  {
    key: "education.subjects.restore",
    description: "Restore subjects",
    category: "Education",
  },

  {
    key: "education.subject_offerings.read",
    description: "Read subject offerings",
    category: "Education",
  },
  {
    key: "education.subject_offerings.create",
    description: "Create subject offerings",
    category: "Education",
  },
  {
    key: "education.subject_offerings.update",
    description: "Update subject offerings",
    category: "Education",
  },
  {
    key: "education.subject_offerings.archive",
    description: "Archive subject offerings",
    category: "Education",
  },
  {
    key: "education.subject_offerings.restore",
    description: "Restore subject offerings",
    category: "Education",
  },

  {
    key: "education.teaching_assignments.read",
    description: "Read teaching assignments",
    category: "Education",
  },
  {
    key: "education.teaching_assignments.create",
    description: "Create teaching assignments",
    category: "Education",
  },
  {
    key: "education.teaching_assignments.update",
    description: "Update teaching assignments",
    category: "Education",
  },
  {
    key: "education.teaching_assignments.end",
    description: "End teaching assignments",
    category: "Education",
  },
];

async function main() {
  console.log("Seeding permissions...");

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description, category: perm.category },
      create: perm,
    });
  }

  console.log("Seeding complete.");
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
