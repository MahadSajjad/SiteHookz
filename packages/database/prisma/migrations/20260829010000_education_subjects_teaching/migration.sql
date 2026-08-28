-- This is an empty migration.


-- Partial unique index for active TeachingAssignment
CREATE UNIQUE INDEX "TeachingAssignment_subjectOfferingId_staffMemberId_key" ON "TeachingAssignment"("subjectOfferingId", "staffMemberId") WHERE "endDate" IS NULL;

-- CHECK constraint for TeachingAssignment dates
ALTER TABLE "TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_endDate_check" CHECK ("endDate" IS NULL OR "endDate" > "startDate");
