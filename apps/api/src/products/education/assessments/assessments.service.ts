import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";
import {
  CreateAssessment,
  UpdateAssessment,
  Assessment,
} from "@sitehookz/education";
import { Prisma } from "@sitehookz/database";
import { BusinessException } from "../../../common/exceptions/business.exception";

const Decimal = Prisma.Decimal;

@Injectable()
export class AssessmentsService {
  constructor(private prisma: PrismaService) {}

  async create(ctx: TenantContext, dto: CreateAssessment): Promise<Assessment> {
    const { subjectOfferingId, maximumMarks, passingMarks, assessmentDate } =
      dto;

    if (new Decimal(maximumMarks).lessThanOrEqualTo(0)) {
      throw new BusinessException(
        "ASSESSMENT_INVALID_MARKS",
        400,
        "Maximum marks must be greater than 0",
      );
    }

    if (passingMarks) {
      if (new Decimal(passingMarks).lessThan(0)) {
        throw new BusinessException(
          "ASSESSMENT_INVALID_MARKS",
          400,
          "Passing marks cannot be negative",
        );
      }
      if (new Decimal(passingMarks).greaterThan(new Decimal(maximumMarks))) {
        throw new BusinessException(
          "ASSESSMENT_INVALID_MARKS",
          400,
          "Passing marks cannot exceed maximum marks",
        );
      }
    }

    const offering = await this.prisma.subjectOffering.findUnique({
      where: { id: subjectOfferingId },
      include: {
        schoolOffering: {
          include: {
            section: {
              include: {
                academicSession: true,
              },
            },
          },
        },
        tuitionOffering: {
          include: {
            batch: true,
          },
        },
      },
    });

    if (!offering) {
      throw new BusinessException(
        "ASSESSMENT_NOT_FOUND",
        404,
        "Subject offering not found",
      );
    }

    if (offering.organizationId !== ctx.organizationId) {
      throw new BusinessException(
        "EDUCATION_CROSS_TENANT_REFERENCE",
        403,
        "Cross-tenant reference not allowed",
      );
    }

    if (!offering.schoolOffering && !offering.tuitionOffering) {
      throw new BusinessException(
        "ASSESSMENT_CONTEXT_MISMATCH",
        400,
        "Subject offering lacks an academic context",
      );
    }

    // Check institution mismatch if context or profile has institutionType
    if ((ctx as any).institutionType) {
      if (
        (ctx as any).institutionType === "SCHOOL" &&
        !offering.schoolOffering
      ) {
        throw new BusinessException(
          "ASSESSMENT_CONTEXT_MISMATCH",
          400,
          "Institution type mismatch: SCHOOL cannot use tuition offering",
        );
      }
      if (
        (ctx as any).institutionType === "TUITION_CENTER" &&
        !offering.tuitionOffering
      ) {
        throw new BusinessException(
          "ASSESSMENT_CONTEXT_MISMATCH",
          400,
          "Institution type mismatch: TUITION_CENTER cannot use school offering",
        );
      }
    }

    const profile = await this.prisma.educationOrganizationProfile.findUnique({
      where: { organizationId: ctx.organizationId },
    });
    if (profile) {
      if (profile.institutionType === "SCHOOL" && !offering.schoolOffering) {
        throw new BusinessException(
          "ASSESSMENT_CONTEXT_MISMATCH",
          400,
          "Institution type mismatch: School organization cannot create assessment on Tuition offering",
        );
      }
      if (
        profile.institutionType === "TUITION_CENTER" &&
        !offering.tuitionOffering
      ) {
        throw new BusinessException(
          "ASSESSMENT_CONTEXT_MISMATCH",
          400,
          "Institution type mismatch: Tuition organization cannot create assessment on School offering",
        );
      }
    }

    const date = new Date(assessmentDate);
    if (isNaN(date.getTime())) {
      throw new BusinessException(
        "ASSESSMENT_DATE_OUTSIDE_ACADEMIC_CONTEXT",
        400,
        "Invalid assessment date",
      );
    }

    if (offering.schoolOffering) {
      const session = offering.schoolOffering.section.academicSession;
      if (session && (date < session.startDate || date > session.endDate)) {
        throw new BusinessException(
          "ASSESSMENT_DATE_OUTSIDE_ACADEMIC_CONTEXT",
          400,
          "Assessment date must be within academic session boundaries",
        );
      }
    } else if (offering.tuitionOffering) {
      const batch = offering.tuitionOffering.batch;
      if (date < batch.startDate || (batch.endDate && date > batch.endDate)) {
        throw new BusinessException(
          "ASSESSMENT_DATE_OUTSIDE_ACADEMIC_CONTEXT",
          400,
          "Assessment date must be within batch boundaries",
        );
      }
    }

    const assessment = await this.prisma.assessment.create({
      data: {
        organizationId: ctx.organizationId,
        subjectOfferingId,
        title: dto.title,
        assessmentType: dto.assessmentType as any,
        assessmentDate: date,
        maximumMarks: maximumMarks,
        passingMarks: passingMarks,
        description: dto.description,
        status: "DRAFT",
        createdByMembershipId: ctx.membershipId!,
      },
    });

    return this.mapToDto(assessment);
  }

  async update(
    ctx: TenantContext,
    id: string,
    dto: UpdateAssessment,
  ): Promise<Assessment> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        subjectOffering: {
          include: {
            schoolOffering: {
              include: {
                section: {
                  include: { academicSession: true },
                },
              },
            },
            tuitionOffering: {
              include: {
                batch: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new BusinessException(
        "ASSESSMENT_NOT_FOUND",
        404,
        "Assessment not found",
      );
    }

    if (assessment.organizationId !== ctx.organizationId) {
      throw new BusinessException(
        "EDUCATION_CROSS_TENANT_REFERENCE",
        403,
        "Cross-tenant reference not allowed",
      );
    }

    // ACTIVE structural immutability check
    if (assessment.status !== "DRAFT") {
      const isStructuralChange =
        (dto as any).subjectOfferingId !== undefined ||
        dto.assessmentType !== undefined ||
        dto.assessmentDate !== undefined ||
        dto.maximumMarks !== undefined ||
        dto.passingMarks !== undefined;

      if (isStructuralChange) {
        throw new BusinessException(
          "ASSESSMENT_INVALID_STATE",
          400,
          "Cannot modify structural fields (type, date, marks, offering) when assessment is not in DRAFT",
        );
      }
    }

    const maxMarks = dto.maximumMarks || assessment.maximumMarks.toString();
    const passMarks =
      dto.passingMarks !== undefined
        ? dto.passingMarks
        : assessment.passingMarks?.toString();

    if (new Decimal(maxMarks).lessThanOrEqualTo(0)) {
      throw new BusinessException(
        "ASSESSMENT_INVALID_MARKS",
        400,
        "Maximum marks must be greater than 0",
      );
    }

    if (passMarks) {
      if (new Decimal(passMarks).lessThan(0)) {
        throw new BusinessException(
          "ASSESSMENT_INVALID_MARKS",
          400,
          "Passing marks cannot be negative",
        );
      }
      if (new Decimal(passMarks).greaterThan(new Decimal(maxMarks))) {
        throw new BusinessException(
          "ASSESSMENT_INVALID_MARKS",
          400,
          "Passing marks cannot exceed maximum marks",
        );
      }
    }

    if (dto.assessmentDate) {
      const date = new Date(dto.assessmentDate);
      if (isNaN(date.getTime())) {
        throw new BusinessException(
          "ASSESSMENT_DATE_OUTSIDE_ACADEMIC_CONTEXT",
          400,
          "Invalid assessment date",
        );
      }
      if (assessment.subjectOffering.schoolOffering) {
        const session =
          assessment.subjectOffering.schoolOffering.section.academicSession;
        if (session && (date < session.startDate || date > session.endDate)) {
          throw new BusinessException(
            "ASSESSMENT_DATE_OUTSIDE_ACADEMIC_CONTEXT",
            400,
            "Assessment date must be within academic session boundaries",
          );
        }
      } else if (assessment.subjectOffering.tuitionOffering) {
        const batch = assessment.subjectOffering.tuitionOffering.batch;
        if (date < batch.startDate || (batch.endDate && date > batch.endDate)) {
          throw new BusinessException(
            "ASSESSMENT_DATE_OUTSIDE_ACADEMIC_CONTEXT",
            400,
            "Assessment date must be within batch boundaries",
          );
        }
      }
    }

    const updated = await this.prisma.assessment.update({
      where: { id },
      data: {
        title: dto.title,
        assessmentType: dto.assessmentType as any,
        assessmentDate: dto.assessmentDate
          ? new Date(dto.assessmentDate)
          : undefined,
        maximumMarks: dto.maximumMarks,
        passingMarks: dto.passingMarks,
        description: dto.description,
      },
    });

    return this.mapToDto(updated);
  }

  async activate(ctx: TenantContext, id: string): Promise<Assessment> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
    });
    if (!assessment) {
      throw new BusinessException(
        "ASSESSMENT_NOT_FOUND",
        404,
        "Assessment not found",
      );
    }
    if (assessment.organizationId !== ctx.organizationId) {
      throw new BusinessException(
        "EDUCATION_CROSS_TENANT_REFERENCE",
        403,
        "Cross-tenant reference not allowed",
      );
    }
    if (assessment.status !== "DRAFT") {
      throw new BusinessException(
        "ASSESSMENT_INVALID_STATE",
        400,
        "Assessment must be in DRAFT to activate",
      );
    }

    const updated = await this.prisma.assessment.update({
      where: { id },
      data: {
        status: "ACTIVE",
        activatedAt: new Date(),
        activatedByMembershipId: ctx.membershipId,
      },
    });

    return this.mapToDto(updated);
  }

  async archive(ctx: TenantContext, id: string): Promise<Assessment> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
    });
    if (!assessment) {
      throw new BusinessException(
        "ASSESSMENT_NOT_FOUND",
        404,
        "Assessment not found",
      );
    }
    if (assessment.organizationId !== ctx.organizationId) {
      throw new BusinessException(
        "EDUCATION_CROSS_TENANT_REFERENCE",
        403,
        "Cross-tenant reference not allowed",
      );
    }

    const updated = await this.prisma.assessment.update({
      where: { id },
      data: {
        status: "ARCHIVED",
        archivedAt: new Date(),
        archivedByMembershipId: ctx.membershipId,
      },
    });
    return this.mapToDto(updated);
  }

  async findById(ctx: TenantContext, id: string): Promise<Assessment> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
    });
    if (!assessment) {
      throw new BusinessException(
        "ASSESSMENT_NOT_FOUND",
        404,
        "Assessment not found",
      );
    }
    if (assessment.organizationId !== ctx.organizationId) {
      throw new BusinessException(
        "EDUCATION_CROSS_TENANT_REFERENCE",
        403,
        "Cross-tenant reference not allowed",
      );
    }
    return this.mapToDto(assessment);
  }

  async findBySubjectOffering(
    ctx: TenantContext,
    subjectOfferingId: string,
  ): Promise<Assessment[]> {
    const assessments = await this.prisma.assessment.findMany({
      where: { subjectOfferingId, organizationId: ctx.organizationId },
      orderBy: { assessmentDate: "desc" },
    });
    return assessments.map(this.mapToDto);
  }

  async findBySection(
    ctx: TenantContext,
    sectionId: string,
  ): Promise<Assessment[]> {
    const assessments = await this.prisma.assessment.findMany({
      where: {
        organizationId: ctx.organizationId,
        subjectOffering: { schoolOffering: { sectionId } },
      },
      orderBy: { assessmentDate: "desc" },
    });
    return assessments.map(this.mapToDto);
  }

  async findByBatch(
    ctx: TenantContext,
    batchId: string,
  ): Promise<Assessment[]> {
    const assessments = await this.prisma.assessment.findMany({
      where: {
        organizationId: ctx.organizationId,
        subjectOffering: { tuitionOffering: { batchId } },
      },
      orderBy: { assessmentDate: "desc" },
    });
    return assessments.map(this.mapToDto);
  }

  public mapToDto(assessment: any): Assessment {
    return {
      ...assessment,
      maximumMarks: assessment.maximumMarks.toString(),
      passingMarks: assessment.passingMarks?.toString() || null,
    } as Assessment;
  }
}
