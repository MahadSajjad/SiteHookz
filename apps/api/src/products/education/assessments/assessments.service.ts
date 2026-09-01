import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";
import {
  CreateAssessment,
  UpdateAssessment,
  Assessment,
} from "@sitehookz/education";
import { Prisma } from "@sitehookz/database";
const Decimal = Prisma.Decimal;

@Injectable()
export class AssessmentsService {
  constructor(private prisma: PrismaService) {}

  async create(ctx: TenantContext, dto: CreateAssessment): Promise<Assessment> {
    const { subjectOfferingId, maximumMarks, passingMarks, assessmentDate } =
      dto;

    if (
      passingMarks &&
      new Decimal(passingMarks).greaterThan(new Decimal(maximumMarks))
    ) {
      throw new BadRequestException(
        "Passing marks cannot exceed maximum marks.",
      );
    }

    const offering = await this.prisma.subjectOffering.findUnique({
      where: { id: subjectOfferingId, organizationId: ctx.organizationId },
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

    if (!offering) throw new NotFoundException("Subject offering not found");

    const date = new Date(assessmentDate);
    if (offering.schoolOffering) {
      const session = offering.schoolOffering.section.academicSession;
      if (session && (date < session.startDate || date > session.endDate)) {
        throw new BadRequestException(
          "Assessment date must be within the academic session boundaries.",
        );
      }
    } else if (offering.tuitionOffering) {
      const batch = offering.tuitionOffering.batch;
      if (date < batch.startDate || (batch.endDate && date > batch.endDate)) {
        throw new BadRequestException(
          "Assessment date must be within the batch boundaries.",
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
      where: { id, organizationId: ctx.organizationId },
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

    if (!assessment) throw new NotFoundException("Assessment not found");
    if (assessment.status !== "DRAFT")
      throw new BadRequestException("Can only update DRAFT assessments");

    const maxMarks = dto.maximumMarks || assessment.maximumMarks.toString();
    const passMarks =
      dto.passingMarks !== undefined
        ? dto.passingMarks
        : assessment.passingMarks?.toString();

    if (
      passMarks &&
      new Decimal(passMarks).greaterThan(new Decimal(maxMarks))
    ) {
      throw new BadRequestException(
        "Passing marks cannot exceed maximum marks.",
      );
    }

    if (dto.assessmentDate) {
      const date = new Date(dto.assessmentDate);
      if (assessment.subjectOffering.schoolOffering) {
        const session =
          assessment.subjectOffering.schoolOffering.section.academicSession;
        if (session && (date < session.startDate || date > session.endDate)) {
          throw new BadRequestException(
            "Assessment date must be within the academic session boundaries.",
          );
        }
      } else if (assessment.subjectOffering.tuitionOffering) {
        const batch = assessment.subjectOffering.tuitionOffering.batch;
        if (date < batch.startDate || (batch.endDate && date > batch.endDate)) {
          throw new BadRequestException(
            "Assessment date must be within the batch boundaries.",
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
      where: { id, organizationId: ctx.organizationId },
    });
    if (!assessment) throw new NotFoundException("Assessment not found");
    if (assessment.status !== "DRAFT")
      throw new BadRequestException("Assessment must be in DRAFT to activate");

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
      where: { id, organizationId: ctx.organizationId },
    });
    if (!assessment) throw new NotFoundException("Assessment not found");

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
      where: { id, organizationId: ctx.organizationId },
    });
    if (!assessment) throw new NotFoundException("Assessment not found");
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
