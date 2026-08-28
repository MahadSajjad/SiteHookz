const fs = require('fs');
const sql = fs.readFileSync('packages/database/full.sql', 'utf8');

const targetModels = [
  'StudentStatus', 'Gender', 'GuardianRelationship', 'EmploymentStatus', 'StaffPositionCategory',
  'StudentAdmissionSequence', 'Student', 'Guardian', 'StudentGuardian', 'StaffMember', 'StaffPosition', 'StaffBranchAssignment'
];

let out = [];

const blocks = sql.split('-- ');
for (const block of blocks) {
  if (block.trim() === '') continue;
  let lines = block.split('\n');
  let header = lines[0];
  let body = lines.slice(1).join('\n');
  
  let shouldInclude = false;
  for (const t of targetModels) {
    if (header.includes(t) || body.includes(`"${t}"`)) {
      shouldInclude = true;
      break;
    }
  }

  if (shouldInclude) {
    out.push('-- ' + block.trim());
  }
}

// Add partial unique indexes
out.push('-- CreateIndex: Partial Unique Index for Primary Guardian');
out.push('CREATE UNIQUE INDEX "StudentGuardian_studentId_isPrimary_key" ON "StudentGuardian"("studentId") WHERE "isPrimary" = true;');

out.push('-- CreateIndex: Partial Unique Index for Primary Active Assignment');
out.push('CREATE UNIQUE INDEX "StaffBranchAssignment_staffMemberId_active_primary_key" ON "StaffBranchAssignment"("staffMemberId") WHERE "isPrimary" = true AND "endDate" IS NULL;');

fs.writeFileSync('packages/database/prisma/migrations/20260828120000_education_people_domain/migration.sql', out.join('\n\n') + '\n', 'utf8');
