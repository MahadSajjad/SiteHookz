-- CreateEnum
CREATE TYPE "SectionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "BatchStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED');
CREATE TYPE "EnrollmentPlacementType" AS ENUM ('SCHOOL', 'TUITION');
CREATE TYPE "EnrollmentStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'WITHDRAWN', 'CANCELLED');
CREATE TYPE "EnrollmentEndReason" AS ENUM ('COMPLETED', 'PROMOTED', 'TRANSFERRED', 'WITHDRAWN', 'CANCELLED', 'CORRECTED');

-- CreateTable
CREATE TABLE "ClassLevel" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClassLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "academicSessionId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "classLevelId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "capacity" INTEGER,
    "status" "SectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "academicSessionId" UUID,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "capacity" INTEGER,
    "status" "BatchStatus" NOT NULL DEFAULT 'PLANNED',
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentEnrollment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "placementType" "EnrollmentPlacementType" NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "endReason" "EnrollmentEndReason",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudentEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolEnrollmentPlacement" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "rollNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SchoolEnrollmentPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TuitionEnrollmentPlacement" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "batchId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TuitionEnrollmentPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassLevel_organizationId_code_key" ON "ClassLevel"("organizationId", "code");
CREATE UNIQUE INDEX "Section_organizationId_academicSessionId_branchId_classLe_key" ON "Section"("organizationId", "academicSessionId", "branchId", "classLevelId", "code");
CREATE UNIQUE INDEX "Course_organizationId_code_key" ON "Course"("organizationId", "code");
CREATE UNIQUE INDEX "Batch_organizationId_courseId_branchId_academicSessionId__key" ON "Batch"("organizationId", "courseId", "branchId", "academicSessionId", "code");
CREATE INDEX "StudentEnrollment_organizationId_idx" ON "StudentEnrollment"("organizationId");
CREATE INDEX "StudentEnrollment_studentId_status_idx" ON "StudentEnrollment"("studentId", "status");
CREATE INDEX "StudentEnrollment_organizationId_branchId_idx" ON "StudentEnrollment"("organizationId", "branchId");
CREATE UNIQUE INDEX "SchoolEnrollmentPlacement_enrollmentId_key" ON "SchoolEnrollmentPlacement"("enrollmentId");
CREATE INDEX "SchoolEnrollmentPlacement_organizationId_idx" ON "SchoolEnrollmentPlacement"("organizationId");
CREATE INDEX "SchoolEnrollmentPlacement_sectionId_idx" ON "SchoolEnrollmentPlacement"("sectionId");
CREATE UNIQUE INDEX "TuitionEnrollmentPlacement_enrollmentId_key" ON "TuitionEnrollmentPlacement"("enrollmentId");
CREATE INDEX "TuitionEnrollmentPlacement_organizationId_idx" ON "TuitionEnrollmentPlacement"("organizationId");
CREATE INDEX "TuitionEnrollmentPlacement_batchId_idx" ON "TuitionEnrollmentPlacement"("batchId");

-- Custom Constraints
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_date_check" CHECK ("endDate" IS NULL OR "endDate" > "startDate");
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_date_check" CHECK ("endDate" IS NULL OR "endDate" > "startDate");
CREATE UNIQUE INDEX "unique_active_school_enrollment" ON "StudentEnrollment"("organizationId", "studentId") WHERE "placementType" = 'SCHOOL' AND "status" = 'ACTIVE';
CREATE UNIQUE INDEX "unique_non_null_roll_number" ON "SchoolEnrollmentPlacement"("sectionId", "rollNumber") WHERE "rollNumber" IS NOT NULL;

