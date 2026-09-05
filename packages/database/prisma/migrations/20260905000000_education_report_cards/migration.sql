-- CreateEnum
CREATE TYPE "GradingScaleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "ReportCardStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ReportCardPassStatus" AS ENUM ('PASS', 'FAIL', 'EXEMPT', 'NOT_GRADED');

-- CreateTable
CREATE TABLE "GradingScale" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "GradingScaleStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradingScale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradingScaleBand" (
    "id" UUID NOT NULL,
    "gradingScaleId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "minimumPercentage" DECIMAL(5,2) NOT NULL,
    "isPassing" BOOLEAN NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradingScaleBand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportCard" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "academicSessionId" UUID NOT NULL,
    "studentEnrollmentId" UUID NOT NULL,
    "sectionId" UUID,
    "batchId" UUID,
    "title" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "ReportCardStatus" NOT NULL DEFAULT 'DRAFT',
    "passStatus" "ReportCardPassStatus" NOT NULL DEFAULT 'NOT_GRADED',
    "totalObtainedMarks" DECIMAL(8,2) NOT NULL,
    "totalMaximumMarks" DECIMAL(8,2) NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "overallGradeCode" TEXT,
    "overallGradeName" TEXT,
    "remarks" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportCardSubjectResult" (
    "id" UUID NOT NULL,
    "reportCardId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "subjectName" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "obtainedMarks" DECIMAL(8,2) NOT NULL,
    "maximumMarks" DECIMAL(8,2) NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "gradeCode" TEXT,
    "gradeName" TEXT,
    "isPassing" BOOLEAN NOT NULL,
    "isExempt" BOOLEAN NOT NULL DEFAULT false,
    "isAbsent" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportCardSubjectResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GradingScale_organizationId_idx" ON "GradingScale"("organizationId");

-- CreateIndex
CREATE INDEX "GradingScaleBand_gradingScaleId_idx" ON "GradingScaleBand"("gradingScaleId");

-- CreateIndex
CREATE UNIQUE INDEX "GradingScaleBand_gradingScaleId_code_key" ON "GradingScaleBand"("gradingScaleId", "code");

-- CreateIndex
CREATE INDEX "ReportCard_organizationId_idx" ON "ReportCard"("organizationId");
CREATE INDEX "ReportCard_studentEnrollmentId_idx" ON "ReportCard"("studentEnrollmentId");
CREATE INDEX "ReportCard_academicSessionId_idx" ON "ReportCard"("academicSessionId");
CREATE INDEX "ReportCard_sectionId_idx" ON "ReportCard"("sectionId");
CREATE INDEX "ReportCard_batchId_idx" ON "ReportCard"("batchId");

-- CreateIndex
CREATE INDEX "ReportCardSubjectResult_reportCardId_idx" ON "ReportCardSubjectResult"("reportCardId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportCardSubjectResult_reportCardId_subjectId_key" ON "ReportCardSubjectResult"("reportCardId", "subjectId");

-- AddForeignKey
ALTER TABLE "GradingScale" ADD CONSTRAINT "GradingScale_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradingScaleBand" ADD CONSTRAINT "GradingScaleBand_gradingScaleId_fkey" FOREIGN KEY ("gradingScaleId") REFERENCES "GradingScale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCard" ADD CONSTRAINT "ReportCard_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCard" ADD CONSTRAINT "ReportCard_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCard" ADD CONSTRAINT "ReportCard_studentEnrollmentId_fkey" FOREIGN KEY ("studentEnrollmentId") REFERENCES "StudentEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCard" ADD CONSTRAINT "ReportCard_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCard" ADD CONSTRAINT "ReportCard_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCardSubjectResult" ADD CONSTRAINT "ReportCardSubjectResult_reportCardId_fkey" FOREIGN KEY ("reportCardId") REFERENCES "ReportCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCardSubjectResult" ADD CONSTRAINT "ReportCardSubjectResult_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Constraints
ALTER TABLE "GradingScaleBand" ADD CONSTRAINT "GradingScaleBand_minimumPercentage_check" CHECK ("minimumPercentage" >= 0 AND "minimumPercentage" <= 100);
ALTER TABLE "ReportCard" ADD CONSTRAINT "ReportCard_period_check" CHECK ("periodStart" <= "periodEnd");
ALTER TABLE "ReportCard" ADD CONSTRAINT "ReportCard_percentage_check" CHECK ("percentage" >= 0 AND "percentage" <= 100);
ALTER TABLE "ReportCardSubjectResult" ADD CONSTRAINT "ReportCardSubjectResult_percentage_check" CHECK ("percentage" >= 0 AND "percentage" <= 100);
