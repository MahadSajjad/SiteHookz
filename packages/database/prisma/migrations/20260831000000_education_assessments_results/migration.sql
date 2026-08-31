-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('QUIZ', 'ASSIGNMENT', 'TEST', 'MIDTERM', 'FINAL', 'PRACTICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RESULTS_PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AssessmentResultStatus" AS ENUM ('GRADED', 'ABSENT', 'EXEMPT');

-- CreateTable
CREATE TABLE "Assessment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "subjectOfferingId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "assessmentType" "AssessmentType" NOT NULL,
    "assessmentDate" DATE NOT NULL,
    "maximumMarks" DECIMAL(10,2) NOT NULL,
    "passingMarks" DECIMAL(10,2),
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "createdByMembershipId" UUID NOT NULL,
    "activatedAt" TIMESTAMP(3),
    "activatedByMembershipId" UUID,
    "resultsPublishedAt" TIMESTAMP(3),
    "resultsPublishedByMembershipId" UUID,
    "archivedAt" TIMESTAMP(3),
    "archivedByMembershipId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentResult" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "assessmentId" UUID NOT NULL,
    "studentEnrollmentId" UUID NOT NULL,
    "resultStatus" "AssessmentResultStatus" NOT NULL,
    "marksObtained" DECIMAL(10,2),
    "comment" TEXT,
    "gradedByMembershipId" UUID NOT NULL,
    "gradedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assessment_organizationId_idx" ON "Assessment"("organizationId");
CREATE INDEX "Assessment_subjectOfferingId_idx" ON "Assessment"("subjectOfferingId");
CREATE INDEX "Assessment_assessmentDate_idx" ON "Assessment"("assessmentDate");
CREATE INDEX "Assessment_assessmentType_idx" ON "Assessment"("assessmentType");
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");

-- CreateIndex
CREATE INDEX "AssessmentResult_organizationId_idx" ON "AssessmentResult"("organizationId");
CREATE INDEX "AssessmentResult_assessmentId_idx" ON "AssessmentResult"("assessmentId");
CREATE INDEX "AssessmentResult_studentEnrollmentId_idx" ON "AssessmentResult"("studentEnrollmentId");
CREATE UNIQUE INDEX "AssessmentResult_assessmentId_studentEnrollmentId_key" ON "AssessmentResult"("assessmentId", "studentEnrollmentId");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_subjectOfferingId_fkey" FOREIGN KEY ("subjectOfferingId") REFERENCES "SubjectOffering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResult" ADD CONSTRAINT "AssessmentResult_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssessmentResult" ADD CONSTRAINT "AssessmentResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssessmentResult" ADD CONSTRAINT "AssessmentResult_studentEnrollmentId_fkey" FOREIGN KEY ("studentEnrollmentId") REFERENCES "StudentEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add Check Constraints
ALTER TABLE "Assessment"
  ADD CONSTRAINT "chk_assessment_max_marks" CHECK ("maximumMarks" > 0),
  ADD CONSTRAINT "chk_assessment_pass_marks" CHECK ("passingMarks" IS NULL OR ("passingMarks" >= 0 AND "passingMarks" <= "maximumMarks"));

ALTER TABLE "AssessmentResult"
  ADD CONSTRAINT "chk_assessmentresult_marks" CHECK (
    ("resultStatus" = 'GRADED' AND "marksObtained" IS NOT NULL AND "marksObtained" >= 0) OR
    ("resultStatus" IN ('ABSENT', 'EXEMPT') AND "marksObtained" IS NULL)
  );
