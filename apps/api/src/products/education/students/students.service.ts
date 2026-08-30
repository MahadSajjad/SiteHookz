import { Injectable, NotFoundException } from "@nestjs/common";

import { BusinessException } from "../../../common/exceptions/business.exception";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";

import { CreateStudentDto, UpdateStudentDto } from "./dto/create-student.dto";

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private auth: AuthorizationService,
  ) {}

  async findAll(tenant: TenantContext, query: any) {
    const {
      search,
      status,
      gender,
      admissionBranchId,
      page,
      limit,
      sort,
      dir,
    } = query;
    const where: any = {
      organizationId: tenant.organizationId,
      archivedAt: null,
    };

    const accessibleBranches = this.auth.getAccessibleBranchIdsForPermission(
      tenant,
      "education.students.read",
    );
    if (accessibleBranches.length === 0)
      return { items: [], total: 0, page: 1, limit: 20 };

    if (accessibleBranches !== "ALL") {
      where.enrollments = {
        some: {
          status: "ACTIVE",
          branchId: { in: accessibleBranches as string[] },
        },
      };
    }

    if (status) where.status = status;
    if (gender) where.gender = gender;
    /* admissionBranchId is origin metadata. Auth now uses enrollment. */
    if (admissionBranchId) where.admissionBranchId = admissionBranchId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { admissionNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: dir },
      }),
      this.prisma.student.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(tenant: TenantContext, id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id, organizationId: tenant.organizationId },
      include: {
        admissionBranch: true,
        studentGuardians: {
          include: { guardian: true },
        },
      },
    });

    if (!student) throw new NotFoundException("STUDENT_NOT_FOUND");

    const accessibleBranchIds = this.auth.getAccessibleBranchIdsForPermission(
      tenant,
      "education.students.read",
    );
    if (accessibleBranchIds !== "ALL") {
      const activeEnr = await this.prisma.studentEnrollment.findFirst({
        where: {
          organizationId: tenant.organizationId,
          studentId: id,
          status: "ACTIVE",
          branchId: { in: accessibleBranchIds as string[] },
        },
      });
      if (!activeEnr) throw new NotFoundException("STUDENT_NOT_FOUND");
    }

    return student;
  }

  async create(tenant: TenantContext, dto: CreateStudentDto) {
    if (dto.admissionBranchId) {
      this.auth.assertPermission(
        tenant,
        "education.students.create",
        dto.admissionBranchId,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const seqBranchId =
        dto.admissionBranchId || "00000000-0000-0000-0000-000000000000";
      const prefix = dto.admissionBranchId
        ? "B" + dto.admissionBranchId.substring(0, 4).toUpperCase()
        : "MAIN";

      const seq = await tx.studentAdmissionSequence.upsert({
        where: {
          organizationId_branchId: {
            organizationId: tenant.organizationId,
            branchId: seqBranchId,
          },
        },
        update: { nextValue: { increment: 1 } },
        create: {
          organizationId: tenant.organizationId,
          branchId: seqBranchId,
          prefix,
          nextValue: 2,
        },
      });

      const admissionNumber = `${prefix}-${String(seq.nextValue - 1).padStart(6, "0")}`;

      return tx.student.create({
        data: {
          organizationId: tenant.organizationId,
          admissionNumber,
          firstName: dto.firstName,
          middleName: dto.middleName,
          lastName: dto.lastName,
          dateOfBirth: dto.dateOfBirth,
          gender: dto.gender,
          phone: dto.phone,
          email: dto.email,
          admissionDate: dto.admissionDate,
          admissionBranchId: dto.admissionBranchId,
          status: dto.status,
        },
      });
    });
  }

  async update(tenant: TenantContext, id: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id, organizationId: tenant.organizationId },
    });
    if (!student) throw new NotFoundException("STUDENT_NOT_FOUND");

    const accessibleBranchIds = this.auth.getAccessibleBranchIdsForPermission(
      tenant,
      "education.students.update",
    );
    if (accessibleBranchIds !== "ALL") {
      const activeEnr = await this.prisma.studentEnrollment.findFirst({
        where: {
          organizationId: tenant.organizationId,
          studentId: id,
          status: "ACTIVE",
          branchId: { in: accessibleBranchIds as string[] },
        },
      });
      if (!activeEnr) throw new NotFoundException("STUDENT_NOT_FOUND");
    }

    return this.prisma.student.update({
      where: { id },
      data: dto,
    });
  }

  async archive(tenant: TenantContext, id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id, organizationId: tenant.organizationId },
    });
    if (!student) throw new NotFoundException("STUDENT_NOT_FOUND");
    if (student.archivedAt)
      throw new BusinessException(
        "STUDENT_ALREADY_ARCHIVED",
        400,
        "Already archived",
      );

    this.auth.assertPermission(tenant, "education.students.archive");

    return this.prisma.student.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
  }

  async restore(tenant: TenantContext, id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id, organizationId: tenant.organizationId },
    });
    if (!student) throw new NotFoundException("STUDENT_NOT_FOUND");
    this.auth.assertPermission(tenant, "education.students.restore");

    return this.prisma.student.update({
      where: { id },
      data: { archivedAt: null },
    });
  }
}
