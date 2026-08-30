-- CreateEnum
CREATE TYPE "TimetableScheduleType" AS ENUM ('SCHOOL', 'TUITION');

-- CreateEnum
CREATE TYPE "TimetableScheduleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TimetableDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "TimetableSchedule" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "scheduleType" "TimetableScheduleType" NOT NULL,
    "name" TEXT NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "status" "TimetableScheduleStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "publishedByMembershipId" UUID,
    "archivedAt" TIMESTAMP(3),
    "archivedByMembershipId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimetableSchedule_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TimetableSchedule_effectiveDate_check" CHECK ("effectiveTo" IS NULL OR "effectiveTo" >= "effectiveFrom")
);

-- CreateTable
CREATE TABLE "SchoolTimetableContext" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "timetableScheduleId" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolTimetableContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TuitionTimetableContext" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "timetableScheduleId" UUID NOT NULL,
    "batchId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TuitionTimetableContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableEntry" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "timetableScheduleId" UUID NOT NULL,
    "subjectOfferingId" UUID NOT NULL,
    "teachingAssignmentId" UUID,
    "dayOfWeek" "TimetableDay" NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimetableEntry_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TimetableEntry_time_check" CHECK ("startMinute" >= 0 AND "startMinute" < 1440 AND "endMinute" > 0 AND "endMinute" <= 1440 AND "startMinute" < "endMinute")
);

-- CreateIndex
CREATE INDEX "TimetableSchedule_organizationId_idx" ON "TimetableSchedule"("organizationId");
CREATE INDEX "TimetableSchedule_branchId_idx" ON "TimetableSchedule"("branchId");
CREATE INDEX "TimetableSchedule_status_idx" ON "TimetableSchedule"("status");
CREATE INDEX "TimetableSchedule_effectiveFrom_idx" ON "TimetableSchedule"("effectiveFrom");
CREATE INDEX "TimetableSchedule_effectiveTo_idx" ON "TimetableSchedule"("effectiveTo");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolTimetableContext_timetableScheduleId_key" ON "SchoolTimetableContext"("timetableScheduleId");
CREATE INDEX "SchoolTimetableContext_organizationId_idx" ON "SchoolTimetableContext"("organizationId");
CREATE INDEX "SchoolTimetableContext_sectionId_idx" ON "SchoolTimetableContext"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "TuitionTimetableContext_timetableScheduleId_key" ON "TuitionTimetableContext"("timetableScheduleId");
CREATE INDEX "TuitionTimetableContext_organizationId_idx" ON "TuitionTimetableContext"("organizationId");
CREATE INDEX "TuitionTimetableContext_batchId_idx" ON "TuitionTimetableContext"("batchId");

-- CreateIndex
CREATE INDEX "TimetableEntry_organizationId_idx" ON "TimetableEntry"("organizationId");
CREATE INDEX "TimetableEntry_timetableScheduleId_idx" ON "TimetableEntry"("timetableScheduleId");
CREATE INDEX "TimetableEntry_dayOfWeek_idx" ON "TimetableEntry"("dayOfWeek");
CREATE INDEX "TimetableEntry_subjectOfferingId_idx" ON "TimetableEntry"("subjectOfferingId");
CREATE INDEX "TimetableEntry_teachingAssignmentId_idx" ON "TimetableEntry"("teachingAssignmentId");

-- AddForeignKey
ALTER TABLE "TimetableSchedule" ADD CONSTRAINT "TimetableSchedule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TimetableSchedule" ADD CONSTRAINT "TimetableSchedule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolTimetableContext" ADD CONSTRAINT "SchoolTimetableContext_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchoolTimetableContext" ADD CONSTRAINT "SchoolTimetableContext_timetableScheduleId_fkey" FOREIGN KEY ("timetableScheduleId") REFERENCES "TimetableSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchoolTimetableContext" ADD CONSTRAINT "SchoolTimetableContext_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuitionTimetableContext" ADD CONSTRAINT "TuitionTimetableContext_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TuitionTimetableContext" ADD CONSTRAINT "TuitionTimetableContext_timetableScheduleId_fkey" FOREIGN KEY ("timetableScheduleId") REFERENCES "TimetableSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TuitionTimetableContext" ADD CONSTRAINT "TuitionTimetableContext_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_timetableScheduleId_fkey" FOREIGN KEY ("timetableScheduleId") REFERENCES "TimetableSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_subjectOfferingId_fkey" FOREIGN KEY ("subjectOfferingId") REFERENCES "SubjectOffering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_teachingAssignmentId_fkey" FOREIGN KEY ("teachingAssignmentId") REFERENCES "TeachingAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
