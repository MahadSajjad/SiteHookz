import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async getStudentEnrollments(tenant: TenantContext, studentId: string) {
    return this.prisma.studentEnrollment.findMany({
      where: { organizationId: tenant.organizationId, studentId },
      include: { schoolPlacement: true, tuitionPlacement: true },
    });
  }

  async createSchoolEnrollment(
    tenant: TenantContext,
    studentId: string,
    dto: any,
  ) {
    if ((tenant as any).institutionType !== "SCHOOL")
      throw new BadRequestException("EDUCATION_INSTITUTION_TYPE_MISMATCH");

    return this.prisma.$transaction(async (tx) => {
      const section = await tx.section.findUnique({
        where: { id: dto.sectionId },
      });
      if (!section || section.organizationId !== tenant.organizationId)
        throw new NotFoundException("SECTION_NOT_FOUND");

      // Lock student
      const studentRows =
        await tx.$queryRaw`SELECT id FROM "Student" WHERE id = ${studentId}::uuid AND "organizationId" = ${tenant.organizationId}::uuid FOR UPDATE`;
      if (!Array.isArray(studentRows) || studentRows.length === 0)
        throw new NotFoundException("STUDENT_NOT_FOUND");

      // Check invariant
      const active = await tx.studentEnrollment.findFirst({
        where: {
          organizationId: tenant.organizationId,
          studentId,
          placementType: "SCHOOL",
          status: "ACTIVE",
        },
      });
      if (active)
        throw new BadRequestException("ENROLLMENT_ACTIVE_SCHOOL_CONFLICT");

      const enrollment = await tx.studentEnrollment.create({
        data: {
          organizationId: tenant.organizationId,
          studentId,
          branchId: section.branchId,
          placementType: "SCHOOL",
          status: dto.status || "ACTIVE",
          startDate: new Date(dto.startDate),
        },
      });

      await tx.schoolEnrollmentPlacement.create({
        data: {
          organizationId: tenant.organizationId,
          enrollmentId: enrollment.id,
          sectionId: section.id,
          rollNumber: dto.rollNumber,
        },
      });

      return enrollment;
    });

    if (
      (tenant as any)
        .institutionType /* TEMP: TenantContext should include institutionType */ !==
      "SCHOOL"
    )
      throw new BadRequestException("EDUCATION_INSTITUTION_TYPE_MISMATCH");

    return this.prisma.$transaction(async (tx) => {
      const section = await tx.section.findUnique({
        where: { id: dto.sectionId },
      });
      if (!section || section.organizationId !== tenant.organizationId)
        throw new NotFoundException("SECTION_NOT_FOUND");

      // Check invariant
      const active = await tx.studentEnrollment.findFirst({
        where: {
          organizationId: tenant.organizationId,
          studentId,
          placementType: "SCHOOL",
          status: "ACTIVE",
        },
      });
      if (active)
        throw new BadRequestException("ENROLLMENT_ACTIVE_SCHOOL_CONFLICT");

      const enrollment = await tx.studentEnrollment.create({
        data: {
          organizationId: tenant.organizationId,
          studentId,
          branchId: section.branchId,
          placementType: "SCHOOL",
          status: dto.status || "ACTIVE",
          startDate: new Date(dto.startDate),
        },
      });

      await tx.schoolEnrollmentPlacement.create({
        data: {
          organizationId: tenant.organizationId,
          enrollmentId: enrollment.id,
          sectionId: section.id,
          rollNumber: dto.rollNumber,
        },
      });

      return enrollment;
    });
  }

  async createTuitionEnrollment(
    tenant: TenantContext,
    studentId: string,
    dto: any,
  ) {
    if ((tenant as any).institutionType === "SCHOOL")
      throw new BadRequestException("EDUCATION_INSTITUTION_TYPE_MISMATCH");

    return this.prisma.$transaction(async (tx) => {
      const batch = await tx.batch.findUnique({ where: { id: dto.batchId } });
      if (!batch || batch.organizationId !== tenant.organizationId)
        throw new NotFoundException("BATCH_NOT_FOUND");

      // 1 & 2. Lock the student
      const studentRows =
        await tx.$queryRaw`SELECT id FROM "Student" WHERE id = ${studentId}::uuid AND "organizationId" = ${tenant.organizationId}::uuid FOR UPDATE`;
      if (!Array.isArray(studentRows) || studentRows.length === 0)
        throw new NotFoundException("STUDENT_NOT_FOUND");

      // 3. Re-check active TUITION enrollment
      const existing = await tx.studentEnrollment.findFirst({
        where: {
          organizationId: tenant.organizationId,
          studentId,
          placementType: "TUITION",
          status: "ACTIVE",
          tuitionPlacement: { batchId: dto.batchId },
        },
      });
      if (existing) throw new BadRequestException("ENROLLMENT_DUPLICATE_BATCH");

      // 5 & 6. Create enrollment and placement
      const enrollment = await tx.studentEnrollment.create({
        data: {
          organizationId: tenant.organizationId,
          studentId,
          branchId: batch.branchId,
          placementType: "TUITION",
          status: dto.status || "ACTIVE",
          startDate: new Date(dto.startDate),
        },
      });

      await tx.tuitionEnrollmentPlacement.create({
        data: {
          organizationId: tenant.organizationId,
          enrollmentId: enrollment.id,
          batchId: batch.id,
        },
      });

      return enrollment;
    });

    if ((tenant as any).institutionType === "SCHOOL")
      throw new BadRequestException("EDUCATION_INSTITUTION_TYPE_MISMATCH");

    return this.prisma.$transaction(async (tx) => {
      const batch = await tx.batch.findUnique({ where: { id: dto.batchId } });
      if (!batch || batch.organizationId !== tenant.organizationId)
        throw new NotFoundException("BATCH_NOT_FOUND");

      // Check duplicate invariant safely inside transaction
      const existing = await tx.studentEnrollment.findFirst({
        where: {
          organizationId: tenant.organizationId,
          studentId,
          placementType: "TUITION",
          status: "ACTIVE",
          tuitionPlacement: { batchId: dto.batchId },
        },
      });
      if (existing) throw new BadRequestException("ENROLLMENT_DUPLICATE_BATCH");

      const enrollment = await tx.studentEnrollment.create({
        data: {
          organizationId: tenant.organizationId,
          studentId,
          branchId: batch.branchId,
          placementType: "TUITION",
          status: dto.status || "ACTIVE",
          startDate: new Date(dto.startDate),
        },
      });

      await tx.tuitionEnrollmentPlacement.create({
        data: {
          organizationId: tenant.organizationId,
          enrollmentId: enrollment.id,
          batchId: batch.id,
        },
      });

      return enrollment;
    });
  }

  async endEnrollment(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.studentEnrollment.update({
      where: { id, organizationId: tenant.organizationId },
      data: {
        status: dto.status || "COMPLETED",
        endDate: new Date(dto.endDate),
        endReason: dto.endReason,
      },
    });
  }

  async promote(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.$transaction(async (tx) => {
      // Lock old enrollment to prevent concurrent transitions
      const lockedRows =
        await tx.$queryRaw`SELECT id, "studentId" FROM "StudentEnrollment" WHERE id = ${id}::uuid AND "organizationId" = ${tenant.organizationId}::uuid FOR UPDATE`;
      if (!Array.isArray(lockedRows) || lockedRows.length === 0)
        throw new NotFoundException();

      const oldEnrollment = await tx.studentEnrollment.findUnique({
        where: { id, organizationId: tenant.organizationId },
      });
      if (!oldEnrollment || oldEnrollment.status !== "ACTIVE")
        throw new BadRequestException("ENROLLMENT_NOT_ACTIVE");

      // end old
      await tx.studentEnrollment.update({
        where: { id },
        data: {
          status: "COMPLETED",
          endDate: new Date(),
          endReason: "PROMOTED",
        },
      });

      // verify section
      const section = await tx.section.findUnique({
        where: { id: dto.targetSectionId },
      });
      if (!section || section.organizationId !== tenant.organizationId)
        throw new NotFoundException("SECTION_NOT_FOUND");

      const newEnrollment = await tx.studentEnrollment.create({
        data: {
          organizationId: tenant.organizationId,
          studentId: oldEnrollment.studentId,
          branchId: section.branchId,
          placementType: "SCHOOL",
          status: "ACTIVE",
          startDate: new Date(dto.effectiveDate || new Date()),
        },
      });

      await tx.schoolEnrollmentPlacement.create({
        data: {
          organizationId: tenant.organizationId,
          enrollmentId: newEnrollment.id,
          sectionId: section.id,
          rollNumber: dto.rollNumber,
        },
      });
      return newEnrollment;
    });

    return this.prisma.$transaction(async (tx) => {
      // end old
      await tx.studentEnrollment.update({
        where: { id, organizationId: tenant.organizationId },
        data: {
          status: "COMPLETED",
          endDate: new Date(),
          endReason: "PROMOTED",
        },
      });

      const oldEnrollment = await tx.studentEnrollment.findUnique({
        where: { id, organizationId: tenant.organizationId },
      });
      if (!oldEnrollment) throw new NotFoundException();

      // verify section
      const section = await tx.section.findUnique({
        where: { id: dto.targetSectionId },
      });
      if (!section || section.organizationId !== tenant.organizationId)
        throw new NotFoundException("SECTION_NOT_FOUND");

      const newEnrollment = await tx.studentEnrollment.create({
        data: {
          organizationId: tenant.organizationId,
          studentId: oldEnrollment.studentId,
          branchId: section.branchId,
          placementType: "SCHOOL",
          status: "ACTIVE",
          startDate: new Date(dto.effectiveDate || new Date()),
        },
      });

      await tx.schoolEnrollmentPlacement.create({
        data: {
          organizationId: tenant.organizationId,
          enrollmentId: newEnrollment.id,
          sectionId: section.id,
          rollNumber: dto.rollNumber,
        },
      });
      return newEnrollment;
    });
  }

  async transfer(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.$transaction(async (tx) => {
      const lockedRows =
        await tx.$queryRaw`SELECT id, "studentId" FROM "StudentEnrollment" WHERE id = ${id}::uuid AND "organizationId" = ${tenant.organizationId}::uuid FOR UPDATE`;
      if (!Array.isArray(lockedRows) || lockedRows.length === 0)
        throw new NotFoundException();

      const oldEnrollment = await tx.studentEnrollment.findUnique({
        where: { id, organizationId: tenant.organizationId },
      });
      if (!oldEnrollment || oldEnrollment.status !== "ACTIVE")
        throw new BadRequestException("ENROLLMENT_NOT_ACTIVE");

      // end old
      await tx.studentEnrollment.update({
        where: { id },
        data: {
          status: "COMPLETED",
          endDate: new Date(),
          endReason: "TRANSFERRED",
        },
      });

      // verify section
      const section = await tx.section.findUnique({
        where: { id: dto.targetSectionId },
      });
      if (!section || section.organizationId !== tenant.organizationId)
        throw new NotFoundException("SECTION_NOT_FOUND");

      const newEnrollment = await tx.studentEnrollment.create({
        data: {
          organizationId: tenant.organizationId,
          studentId: oldEnrollment.studentId,
          branchId: section.branchId,
          placementType: "SCHOOL",
          status: "ACTIVE",
          startDate: new Date(dto.effectiveDate || new Date()),
        },
      });

      await tx.schoolEnrollmentPlacement.create({
        data: {
          organizationId: tenant.organizationId,
          enrollmentId: newEnrollment.id,
          sectionId: section.id,
          rollNumber: dto.rollNumber,
        },
      });
      return newEnrollment;
    });

    return this.prisma.$transaction(async (tx) => {
      // end old
      await tx.studentEnrollment.update({
        where: { id, organizationId: tenant.organizationId },
        data: {
          status: "COMPLETED",
          endDate: new Date(),
          endReason: "TRANSFERRED",
        },
      });

      const oldEnrollment = await tx.studentEnrollment.findUnique({
        where: { id, organizationId: tenant.organizationId },
      });
      if (!oldEnrollment) throw new NotFoundException();

      // verify section
      const section = await tx.section.findUnique({
        where: { id: dto.targetSectionId },
      });
      if (!section || section.organizationId !== tenant.organizationId)
        throw new NotFoundException("SECTION_NOT_FOUND");

      const newEnrollment = await tx.studentEnrollment.create({
        data: {
          organizationId: tenant.organizationId,
          studentId: oldEnrollment.studentId,
          branchId: section.branchId,
          placementType: "SCHOOL",
          status: "ACTIVE",
          startDate: new Date(dto.effectiveDate || new Date()),
        },
      });

      await tx.schoolEnrollmentPlacement.create({
        data: {
          organizationId: tenant.organizationId,
          enrollmentId: newEnrollment.id,
          sectionId: section.id,
          rollNumber: dto.rollNumber,
        },
      });
      return newEnrollment;
    });
  }

  async changeSection(tenant: TenantContext, id: string, dto: any) {
    return this.transfer(tenant, id, dto);
  }

  async changeBatch(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.$transaction(async (tx) => {
      // end old
      await tx.studentEnrollment.update({
        where: { id, organizationId: tenant.organizationId },
        data: {
          status: "COMPLETED",
          endDate: new Date(),
          endReason: "TRANSFERRED",
        },
      });

      const oldEnrollment = await tx.studentEnrollment.findUnique({
        where: { id, organizationId: tenant.organizationId },
      });
      if (!oldEnrollment) throw new NotFoundException();

      const batch = await tx.batch.findUnique({
        where: { id: dto.targetBatchId },
      });
      if (!batch || batch.organizationId !== tenant.organizationId)
        throw new NotFoundException("BATCH_NOT_FOUND");

      const newEnrollment = await tx.studentEnrollment.create({
        data: {
          organizationId: tenant.organizationId,
          studentId: oldEnrollment.studentId,
          branchId: batch.branchId,
          placementType: "TUITION",
          status: "ACTIVE",
          startDate: new Date(dto.effectiveDate || new Date()),
        },
      });

      await tx.tuitionEnrollmentPlacement.create({
        data: {
          organizationId: tenant.organizationId,
          enrollmentId: newEnrollment.id,
          batchId: batch.id,
        },
      });
      return newEnrollment;
    });
  }
}
