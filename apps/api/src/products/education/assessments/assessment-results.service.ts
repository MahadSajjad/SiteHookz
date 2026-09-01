import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";
import {
  BulkAssessmentResults,
  AssessmentRosterItem,
  StudentAssessmentHistory,
} from "@sitehookz/education";
import { AssessmentsService } from "./assessments.service";
import { Prisma } from "@sitehookz/database";
const Decimal = Prisma.Decimal;

@Injectable()
export class AssessmentResultsService {
  constructor(
    private prisma: PrismaService,
    private assessmentsService: AssessmentsService,
  ) {}

  async getRoster(
    ctx: TenantContext,
    assessmentId: string,
  ): Promise<AssessmentRosterItem[]> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId, organizationId: ctx.organizationId },
      include: { subjectOffering: true },
    });
    if (!assessment) throw new NotFoundException("Assessment not found");

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        organizationId: ctx.organizationId,
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
      include: {
        student: true,
        assessmentResults: {
          where: { assessmentId },
        },
      },
    });

    return enrollments
      .filter((e: any) => e.placementDate <= assessment.assessmentDate)
      .map((e: any) => {
        const result = e.assessmentResults[0];
        return {
          studentEnrollmentId: e.id,
          studentId: e.studentId,
          studentName: e.student.name,
          rollNumber: e.rollNumber,
          resultStatus: result ? (result.resultStatus as any) : null,
          marksObtained: result?.marksObtained?.toString() || null,
          comment: result?.comment || null,
          gradedByName: null,
          gradedAt: result?.gradedAt || null,
        };
      });
  }

  async bulkGrade(
    ctx: TenantContext,
    assessmentId: string,
    dto: BulkAssessmentResults,
  ): Promise<void> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId, organizationId: ctx.organizationId },
    });
    if (!assessment) throw new NotFoundException("Assessment not found");
    if (assessment.status !== "ACTIVE")
      throw new BadRequestException("Assessment must be ACTIVE to grade");

    const maxMarks = new Decimal(assessment.maximumMarks);

    await this.prisma.$transaction(
      dto.results.map((r: any) => {
        if (r.resultStatus === "GRADED") {
          if (!r.marksObtained)
            throw new BadRequestException(
              "Marks obtained is required for GRADED status",
            );
          if (new Decimal(r.marksObtained).greaterThan(maxMarks)) {
            throw new BadRequestException(
              "Marks obtained cannot exceed maximum marks",
            );
          }
        }

        return this.prisma.assessmentResult.upsert({
          where: {
            assessmentId_studentEnrollmentId: {
              assessmentId,
              studentEnrollmentId: r.studentEnrollmentId,
            },
          },
          update: {
            resultStatus: r.resultStatus as any,
            marksObtained: r.resultStatus === "GRADED" ? r.marksObtained : null,
            comment: r.comment,
            gradedByMembershipId: ctx.membershipId!,
            gradedAt: new Date(),
          },
          create: {
            organizationId: ctx.organizationId,
            assessmentId,
            studentEnrollmentId: r.studentEnrollmentId,
            resultStatus: r.resultStatus as any,
            marksObtained: r.resultStatus === "GRADED" ? r.marksObtained : null,
            comment: r.comment,
            gradedByMembershipId: ctx.membershipId!,
            gradedAt: new Date(),
          },
        });
      }),
    );
  }

  async publishResults(
    ctx: TenantContext,
    assessmentId: string,
  ): Promise<void> {
    const roster = await this.getRoster(ctx, assessmentId);
    const incomplete = roster.some((r: any) => !r.resultStatus);
    if (incomplete) {
      throw new BadRequestException(
        "Cannot publish results. Some students are not graded.",
      );
    }

    await this.prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: "RESULTS_PUBLISHED",
        resultsPublishedAt: new Date(),
        resultsPublishedByMembershipId: ctx.membershipId,
      },
    });
  }

  async studentHistory(
    ctx: TenantContext,
    studentId: string,
  ): Promise<StudentAssessmentHistory[]> {
    const results = await this.prisma.assessmentResult.findMany({
      where: {
        organizationId: ctx.organizationId,
        studentEnrollment: { studentId },
        assessment: { status: "RESULTS_PUBLISHED" },
      },
      include: {
        assessment: {
          include: { subjectOffering: { include: { subject: true } } },
        },
      },
      orderBy: { assessment: { assessmentDate: "desc" } },
    });

    return results.map((r: any) => {
      const marks = r.marksObtained
        ? new Decimal(r.marksObtained.toString())
        : null;
      const max = new Decimal(r.assessment.maximumMarks.toString());
      const percentage = marks
        ? marks.dividedBy(max).times(100).toNumber()
        : null;
      let passStatus = null;
      if (r.assessment.passingMarks && marks) {
        passStatus = marks.greaterThanOrEqualTo(
          new Decimal(r.assessment.passingMarks.toString()),
        );
      }

      return {
        assessmentId: r.assessmentId,
        title: r.assessment.title,
        assessmentType: r.assessment.assessmentType as any,
        assessmentDate: r.assessment.assessmentDate,
        maximumMarks: r.assessment.maximumMarks.toString(),
        passingMarks: r.assessment.passingMarks?.toString() || null,
        status: r.assessment.status as any,
        resultStatus: r.resultStatus as any,
        marksObtained: r.marksObtained?.toString() || null,
        percentage,
        passStatus,
        comment: r.comment,
        gradedAt: r.gradedAt,
        subjectName: r.assessment.subjectOffering.subject.name,
      };
    });
  }
}
