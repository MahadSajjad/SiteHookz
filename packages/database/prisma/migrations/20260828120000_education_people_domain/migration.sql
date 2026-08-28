-- CreateIndex: Partial Unique Index for Primary Guardian
CREATE UNIQUE INDEX "StudentGuardian_studentId_isPrimary_key" ON "StudentGuardian"("studentId") WHERE "isPrimary" = true;
-- CreateIndex: Partial Unique Index for Primary Active Assignment
CREATE UNIQUE INDEX "StaffBranchAssignment_staffMemberId_active_primary_key" ON "StaffBranchAssignment"("staffMemberId") WHERE "isPrimary" = true AND "endDate" IS NULL;