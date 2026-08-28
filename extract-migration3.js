const fs = require('fs');
const sql = fs.readFileSync('packages/database/full.sql', 'utf8');
const lines = sql.split('\n');

let out = [];
let capturing = false;

for (const line of lines) {
  if (line.startsWith('CREATE TYPE "StudentStatus"')) capturing = true;
  if (line.startsWith('CREATE TABLE "UserAccount"')) capturing = false;
  if (line.startsWith('CREATE UNIQUE INDEX "StudentAdmissionSequence')) capturing = true;
  if (line.startsWith('ALTER TABLE "Organization"')) capturing = false;
  if (line.startsWith('ALTER TABLE "StudentAdmissionSequence"')) capturing = true;
  
  if (capturing) {
    out.push(line);
  }
}

out.push('-- CreateIndex: Partial Unique Index for Primary Guardian');
out.push('CREATE UNIQUE INDEX "StudentGuardian_studentId_isPrimary_key" ON "StudentGuardian"("studentId") WHERE "isPrimary" = true;');

out.push('-- CreateIndex: Partial Unique Index for Primary Active Assignment');
out.push('CREATE UNIQUE INDEX "StaffBranchAssignment_staffMemberId_active_primary_key" ON "StaffBranchAssignment"("staffMemberId") WHERE "isPrimary" = true AND "endDate" IS NULL;');

fs.writeFileSync('packages/database/prisma/migrations/20260828120000_education_people_domain/migration.sql', out.join('\n'), 'utf8');
