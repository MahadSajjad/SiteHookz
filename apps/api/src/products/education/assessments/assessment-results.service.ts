import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";
import {
  BulkAssessmentResults,
  AssessmentRosterItem,
  StudentAssessmentHistory,
} from "@sitehookz/education";
import { AssessmentsService } from "./assessments.service";
import { Prisma } from "@sitehookz/database";
import { BusinessException } from "../../../common/exceptions/business.exception";

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
      where: { id: assessmentId },
      include: {
        subjectOffering: {
          include: {
            schoolOffering: true,
            tuitionOffering: true,
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

    let whereClause: Prisma.StudentEnrollmentWhereInput;
    if (assessment.subjectOffering.schoolOffering) {
      const sectionId = assessment.subjectOffering.schoolOffering.sectionId;
      whereClause = {
        organizationId: ctx.organizationId,
        placementType: "SCHOOL",
        schoolPlacement: { sectionId },
        startDate: { lte: assessment.assessmentDate },
        OR: [
          { endDate: null },
          { endDate: { gte: assessment.assessmentDate } },
        ],
      };
    } else if (assessment.subjectOffering.tuitionOffering) {
      const batchId = assessment.subjectOffering.tuitionOffering.batchId;
      whereClause = {
        organizationId: ctx.organizationId,
        placementType: "TUITION",
        tuitionPlacement: { batchId },
        startDate: { lte: assessment.assessmentDate },
        OR: [
          { endDate: null },
          { endDate: { gte: assessment.assessmentDate } },
        ],
      };
    } else {
      throw new BusinessException(
        "ASSESSMENT_CONTEXT_MISMATCH",
        400,
        "Subject offering lacks academic context",
      );
    }

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: whereClause,
      include: {
        student: true,
        schoolPlacement: true,
        assessmentResults: {
          where: { assessmentId },
        },
      },
      orderBy: {
        student: { firstName: "asc" },
      },
    });

    return enrollments.map((e) => {
      const result = e.assessmentResults[0];
      const studentName =
        [e.student.firstName, e.student.middleName, e.student.lastName]
          .filter(Boolean)
          .join(" ") || "Student";
      return {
        studentEnrollmentId: e.id,
        studentId: e.studentId,
        studentName,
        rollNumber: e.schoolPlacement?.rollNumber || null,
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
      where: { id: assessmentId },
      include: {
        subjectOffering: {
          include: {
            schoolOffering: true,
            tuitionOffering: true,
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

    if (assessment.status === "RESULTS_PUBLISHED") {
      throw new BusinessException(
        "ASSESSMENT_RESULTS_PUBLISHED",
        400,
        "Results have already been published and cannot be modified",
      );
    }

    if (assessment.status !== "ACTIVE") {
      throw new BusinessException(
        "ASSESSMENT_INVALID_STATE",
        400,
        "Assessment must be ACTIVE to grade",
      );
    }

    const maxMarks = new Decimal(assessment.maximumMarks);

    // Validate results items
    for (const r of dto.results) {
      if (r.resultStatus === "GRADED") {
        if (r.marksObtained === undefined || r.marksObtained === null) {
          throw new BusinessException(
            "ASSESSMENT_RESULT_INVALID",
            400,
            "Marks obtained is required for GRADED status",
          );
        }
        const marks = new Decimal(r.marksObtained);
        if (marks.lessThan(0)) {
          throw new BusinessException(
            "ASSESSMENT_INVALID_MARKS",
            400,
            "Marks obtained cannot be negative",
          );
        }
        if (marks.greaterThan(maxMarks)) {
          throw new BusinessException(
            "ASSESSMENT_INVALID_MARKS",
            400,
            "Marks obtained cannot exceed maximum marks",
          );
        }
      } else if (r.resultStatus === "ABSENT" || r.resultStatus === "EXEMPT") {
        if (r.marksObtained !== undefined && r.marksObtained !== null) {
          throw new BusinessException(
            "ASSESSMENT_RESULT_INVALID",
            400,
            `${r.resultStatus} status must not have marks obtained`,
          );
        }
      } else {
        throw new BusinessException(
          "ASSESSMENT_RESULT_INVALID",
          400,
          "Invalid result status",
        );
      }

      // Check enrollment eligibility
      const enrollment = await this.prisma.studentEnrollment.findUnique({
        where: { id: r.studentEnrollmentId },
        include: {
          schoolPlacement: true,
          tuitionPlacement: true,
        },
      });

      if (!enrollment) {
        throw new BusinessException(
          "ASSESSMENT_ENROLLMENT_NOT_ELIGIBLE",
          404,
          `Student enrollment ${r.studentEnrollmentId} not found`,
        );
      }

      if (enrollment.organizationId !== ctx.organizationId) {
        throw new BusinessException(
          "EDUCATION_CROSS_TENANT_REFERENCE",
          403,
          "Cross-tenant enrollment not allowed",
        );
      }

      const assessmentDate = assessment.assessmentDate;
      const isDateEligible =
        enrollment.startDate <= assessmentDate &&
        (enrollment.endDate === null || enrollment.endDate >= assessmentDate);

      if (!isDateEligible) {
        throw new BusinessException(
          "ASSESSMENT_ENROLLMENT_NOT_ELIGIBLE",
          400,
          "Enrollment is not historically active on assessment date",
        );
      }

      if (assessment.subjectOffering.schoolOffering) {
        if (
          enrollment.placementType !== "SCHOOL" ||
          enrollment.schoolPlacement?.sectionId !==
            assessment.subjectOffering.schoolOffering.sectionId
        ) {
          throw new BusinessException(
            "ASSESSMENT_ENROLLMENT_NOT_ELIGIBLE",
            400,
            "Enrollment does not belong to the assessment's section",
          );
        }
      } else if (assessment.subjectOffering.tuitionOffering) {
        if (
          enrollment.placementType !== "TUITION" ||
          enrollment.tuitionPlacement?.batchId !==
            assessment.subjectOffering.tuitionOffering.batchId
        ) {
          throw new BusinessException(
            "ASSESSMENT_ENROLLMENT_NOT_ELIGIBLE",
            400,
            "Enrollment does not belong to the assessment's batch",
          );
        }
      }
    }

    await this.prisma.$transaction(
      dto.results.map((r) => {
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
            comment: r.comment ?? null,
            gradedByMembershipId: ctx.membershipId!,
            gradedAt: new Date(),
          },
          create: {
            organizationId: ctx.organizationId,
            assessmentId,
            studentEnrollmentId: r.studentEnrollmentId,
            resultStatus: r.resultStatus as any,
            marksObtained: r.resultStatus === "GRADED" ? r.marksObtained : null,
            comment: r.comment ?? null,
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
    await this.prisma.$transaction(async (tx) => {
      // 1. Row-lock using parameterized raw query
      const locked = await tx.$queryRaw<Array<{ id: string }>>(
        Prisma.sql`SELECT id FROM "Assessment" WHERE id = ${assessmentId}::uuid AND "organizationId" = ${ctx.organizationId}::uuid FOR UPDATE`,
      );

      if (!locked || locked.length === 0) {
        throw new BusinessException(
          "ASSESSMENT_NOT_FOUND",
          404,
          "Assessment not found",
        );
      }

      const assessment = await tx.assessment.findUnique({
        where: { id: assessmentId, organizationId: ctx.organizationId },
        include: {
          subjectOffering: {
            include: {
              schoolOffering: true,
              tuitionOffering: true,
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

      // If already published, deterministic idempotent return
      if (assessment.status === "RESULTS_PUBLISHED") {
        return;
      }

      if (assessment.status !== "ACTIVE") {
        throw new BusinessException(
          "ASSESSMENT_INVALID_STATE",
          400,
          "Assessment must be ACTIVE to publish results",
        );
      }

      let whereClause: Prisma.StudentEnrollmentWhereInput;
      if (assessment.subjectOffering.schoolOffering) {
        const sectionId = assessment.subjectOffering.schoolOffering.sectionId;
        whereClause = {
          organizationId: ctx.organizationId,
          placementType: "SCHOOL",
          schoolPlacement: { sectionId },
          startDate: { lte: assessment.assessmentDate },
          OR: [
            { endDate: null },
            { endDate: { gte: assessment.assessmentDate } },
          ],
        };
      } else if (assessment.subjectOffering.tuitionOffering) {
        const batchId = assessment.subjectOffering.tuitionOffering.batchId;
        whereClause = {
          organizationId: ctx.organizationId,
          placementType: "TUITION",
          tuitionPlacement: { batchId },
          startDate: { lte: assessment.assessmentDate },
          OR: [
            { endDate: null },
            { endDate: { gte: assessment.assessmentDate } },
          ],
        };
      } else {
        throw new BusinessException(
          "ASSESSMENT_CONTEXT_MISMATCH",
          400,
          "Subject offering lacks academic context",
        );
      }

      const enrollments = await tx.studentEnrollment.findMany({
        where: whereClause,
        include: {
          assessmentResults: {
            where: { assessmentId },
          },
        },
      });

      const incomplete = enrollments.some(
        (e) =>
          !e.assessmentResults ||
          e.assessmentResults.length === 0 ||
          !e.assessmentResults[0]?.resultStatus,
      );

      if (incomplete) {
        throw new BusinessException(
          "ASSESSMENT_RESULTS_INCOMPLETE",
          400,
          "Cannot publish results. Some eligible students are not graded.",
        );
      }

      await tx.assessment.update({
        where: { id: assessmentId },
        data: {
          status: "RESULTS_PUBLISHED",
          resultsPublishedAt: new Date(),
          resultsPublishedByMembershipId: ctx.membershipId,
        },
      });
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
