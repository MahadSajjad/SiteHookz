-- CreateEnum
CREATE TYPE "AttendanceMode" AS ENUM ('DAILY', 'SUBJECT');

-- CreateEnum
CREATE TYPE "AttendanceSessionStatus" AS ENUM ('DRAFT', 'FINALIZED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StudentAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateTable
CREATE TABLE "AttendanceSession" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "mode" "AttendanceMode" NOT NULL,
    "attendanceDate" DATE NOT NULL,
    "occurrenceNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "AttendanceSessionStatus" NOT NULL DEFAULT 'DRAFT',
    "note" TEXT,
    "createdByMembershipId" UUID NOT NULL,
    "finalizedAt" TIMESTAMP(3),
    "finalizedByMembershipId" UUID,
    "cancelledAt" TIMESTAMP(3),
    "cancelledByMembershipId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolAttendanceContext" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "attendanceSessionId" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "subjectOfferingId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolAttendanceContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TuitionAttendanceContext" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "attendanceSessionId" UUID NOT NULL,
    "batchId" UUID NOT NULL,
    "subjectOfferingId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TuitionAttendanceContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAttendanceRecord" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "attendanceSessionId" UUID NOT NULL,
    "studentEnrollmentId" UUID NOT NULL,
    "status" "StudentAttendanceStatus" NOT NULL,
    "note" TEXT,
    "markedByMembershipId" UUID NOT NULL,
    "markedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttendanceSession_organizationId_idx" ON "AttendanceSession"("organizationId");

-- CreateIndex
CREATE INDEX "AttendanceSession_branchId_idx" ON "AttendanceSession"("branchId");

-- CreateIndex
CREATE INDEX "AttendanceSession_attendanceDate_idx" ON "AttendanceSession"("attendanceDate");

-- CreateIndex
CREATE INDEX "AttendanceSession_status_idx" ON "AttendanceSession"("status");

-- CreateIndex
CREATE INDEX "AttendanceSession_mode_idx" ON "AttendanceSession"("mode");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolAttendanceContext_attendanceSessionId_key" ON "SchoolAttendanceContext"("attendanceSessionId");

-- CreateIndex
CREATE INDEX "SchoolAttendanceContext_organizationId_idx" ON "SchoolAttendanceContext"("organizationId");

-- CreateIndex
CREATE INDEX "SchoolAttendanceContext_sectionId_idx" ON "SchoolAttendanceContext"("sectionId");

-- CreateIndex
CREATE INDEX "SchoolAttendanceContext_subjectOfferingId_idx" ON "SchoolAttendanceContext"("subjectOfferingId");

-- CreateIndex
CREATE UNIQUE INDEX "TuitionAttendanceContext_attendanceSessionId_key" ON "TuitionAttendanceContext"("attendanceSessionId");

-- CreateIndex
CREATE INDEX "TuitionAttendanceContext_organizationId_idx" ON "TuitionAttendanceContext"("organizationId");

-- CreateIndex
CREATE INDEX "TuitionAttendanceContext_batchId_idx" ON "TuitionAttendanceContext"("batchId");

-- CreateIndex
CREATE INDEX "TuitionAttendanceContext_subjectOfferingId_idx" ON "TuitionAttendanceContext"("subjectOfferingId");

-- CreateIndex
CREATE INDEX "StudentAttendanceRecord_organizationId_idx" ON "StudentAttendanceRecord"("organizationId");

-- CreateIndex
CREATE INDEX "StudentAttendanceRecord_attendanceSessionId_idx" ON "StudentAttendanceRecord"("attendanceSessionId");

-- CreateIndex
CREATE INDEX "StudentAttendanceRecord_studentEnrollmentId_idx" ON "StudentAttendanceRecord"("studentEnrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAttendanceRecord_attendanceSessionId_studentEnrollme_key" ON "StudentAttendanceRecord"("attendanceSessionId", "studentEnrollmentId");

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAttendanceContext" ADD CONSTRAINT "SchoolAttendanceContext_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAttendanceContext" ADD CONSTRAINT "SchoolAttendanceContext_attendanceSessionId_fkey" FOREIGN KEY ("attendanceSessionId") REFERENCES "AttendanceSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAttendanceContext" ADD CONSTRAINT "SchoolAttendanceContext_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAttendanceContext" ADD CONSTRAINT "SchoolAttendanceContext_subjectOfferingId_fkey" FOREIGN KEY ("subjectOfferingId") REFERENCES "SubjectOffering"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuitionAttendanceContext" ADD CONSTRAINT "TuitionAttendanceContext_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuitionAttendanceContext" ADD CONSTRAINT "TuitionAttendanceContext_attendanceSessionId_fkey" FOREIGN KEY ("attendanceSessionId") REFERENCES "AttendanceSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuitionAttendanceContext" ADD CONSTRAINT "TuitionAttendanceContext_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuitionAttendanceContext" ADD CONSTRAINT "TuitionAttendanceContext_subjectOfferingId_fkey" FOREIGN KEY ("subjectOfferingId") REFERENCES "SubjectOffering"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendanceRecord" ADD CONSTRAINT "StudentAttendanceRecord_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendanceRecord" ADD CONSTRAINT "StudentAttendanceRecord_attendanceSessionId_fkey" FOREIGN KEY ("attendanceSessionId") REFERENCES "AttendanceSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendanceRecord" ADD CONSTRAINT "StudentAttendanceRecord_studentEnrollmentId_fkey" FOREIGN KEY ("studentEnrollmentId") REFERENCES "StudentEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
