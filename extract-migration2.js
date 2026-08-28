const fs = require('fs');
const sql = fs.readFileSync('packages/database/full.sql', 'utf8');

const regexes = [
  /CREATE TYPE "StudentStatus".*?;/g,
  /CREATE TYPE "Gender".*?;/g,
  /CREATE TYPE "GuardianRelationship".*?;/g,
  /CREATE TYPE "EmploymentStatus".*?;/g,
  /CREATE TYPE "StaffPositionCategory".*?;/g,
  /CREATE TABLE "StudentAdmissionSequence" \([\s\S]*?\);/g,
  /CREATE TABLE "Student" \([\s\S]*?\);/g,
  /CREATE TABLE "Guardian" \([\s\S]*?\);/g,
  /CREATE TABLE "StudentGuardian" \([\s\S]*?\);/g,
  /CREATE TABLE "StaffMember" \([\s\S]*?\);/g,
  /CREATE TABLE "StaffPosition" \([\s\S]*?\);/g,
  /CREATE TABLE "StaffBranchAssignment" \([\s\S]*?\);/g,
  /CREATE (?:UNIQUE )?INDEX .*? ON "StudentAdmissionSequence".*?;/g,
  /CREATE (?:UNIQUE )?INDEX .*? ON "Student".*?;/g,
  /CREATE (?:UNIQUE )?INDEX .*? ON "Guardian".*?;/g,
  /CREATE (?:UNIQUE )?INDEX .*? ON "StudentGuardian".*?;/g,
  /CREATE (?:UNIQUE )?INDEX .*? ON "StaffMember".*?;/g,
  /CREATE (?:UNIQUE )?INDEX .*? ON "StaffPosition".*?;/g,
  /CREATE (?:UNIQUE )?INDEX .*? ON "StaffBranchAssignment".*?;/g,
  /ALTER TABLE "StudentAdmissionSequence" ADD CONSTRAINT.*?;/g,
  /ALTER TABLE "Student" ADD CONSTRAINT.*?;/g,
  /ALTER TABLE "Guardian" ADD CONSTRAINT.*?;/g,
  /ALTER TABLE "StudentGuardian" ADD CONSTRAINT.*?;/g,
  /ALTER TABLE "StaffMember" ADD CONSTRAINT.*?;/g,
  /ALTER TABLE "StaffPosition" ADD CONSTRAINT.*?;/g,
  /ALTER TABLE "StaffBranchAssignment" ADD CONSTRAINT.*?;/g,
];

let out = [];
for (const r of regexes) {
  const matches = sql.match(r);
  if (matches) {
    out.push(...matches);
  }
}

out.push('-- CreateIndex: Partial Unique Index for Primary Guardian');
out.push('CREATE UNIQUE INDEX "StudentGuardian_studentId_isPrimary_key" ON "StudentGuardian"("studentId") WHERE "isPrimary" = true;');

out.push('-- CreateIndex: Partial Unique Index for Primary Active Assignment');
out.push('CREATE UNIQUE INDEX "StaffBranchAssignment_staffMemberId_active_primary_key" ON "StaffBranchAssignment"("staffMemberId") WHERE "isPrimary" = true AND "endDate" IS NULL;');

fs.writeFileSync('packages/database/prisma/migrations/20260828120000_education_people_domain/migration.sql', out.join('\n\n') + '\n', 'utf8');
