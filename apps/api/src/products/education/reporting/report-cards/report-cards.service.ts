import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/database/prisma.service";
import { TenantContext } from "../../../../platform/tenancy/tenant.guard";
import {
  GenerateReportCardsDto,
  PublishReportCardsDto,
  ReportCard,
  ReportCardStatus,
  ReportCardPassStatus,
  ReportCardSubjectResult,
} from "@sitehookz/education";
import { Prisma } from "@sitehookz/database";
import { BusinessException } from "../../../../common/exceptions/business.exception";

const Decimal = Prisma.Decimal;

@Injectable()
export class ReportCardsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapReportCard(card: any): ReportCard {
    return {
      id: card.id,
      organizationId: card.organizationId,
      academicSessionId: card.academicSessionId,
      studentEnrollmentId: card.studentEnrollmentId,
      sectionId: card.sectionId,
      batchId: card.batchId,
      title: card.title,
      periodStart: card.periodStart,
      periodEnd: card.periodEnd,
      status: card.status as ReportCardStatus,
      passStatus: card.passStatus as ReportCardPassStatus,
      totalObtainedMarks: Number(card.totalObtainedMarks),
      totalMaximumMarks: Number(card.totalMaximumMarks),
      percentage: Number(card.percentage),
      overallGradeCode: card.overallGradeCode,
      overallGradeName: card.overallGradeName,
      remarks: card.remarks,
      publishedAt: card.publishedAt,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      subjectResults: card.subjectResults
        ? card.subjectResults.map((sr: any): ReportCardSubjectResult => ({
            id: sr.id,
            reportCardId: sr.reportCardId,
            subjectId: sr.subjectId,
            subjectName: sr.subjectName,
            subjectCode: sr.subjectCode,
            obtainedMarks: Number(sr.obtainedMarks),
            maximumMarks: Number(sr.maximumMarks),
            percentage: Number(sr.percentage),
            gradeCode: sr.gradeCode,
            gradeName: sr.gradeName,
            isPassing: sr.isPassing,
            isExempt: sr.isExempt,
            isAbsent: sr.isAbsent,
            remarks: sr.remarks,
            createdAt: sr.createdAt,
            updatedAt: sr.updatedAt,
          }))
        : [],
    };
  }

  private matchBand(bands: any[], percentage: number) {
    if (!bands || bands.length === 0) return null;
    const sorted = [...bands].sort(
      (a, b) => Number(b.minimumPercentage) - Number(a.minimumPercentage),
    );
    for (const band of sorted) {
      if (percentage >= Number(band.minimumPercentage)) {
        return band;
      }
    }
    return sorted[sorted.length - 1] || null;
  }

  async generate(
    ctx: TenantContext,
    dto: GenerateReportCardsDto,
  ): Promise<ReportCard[]> {
    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);

    if (periodStart > periodEnd) {
      throw new BusinessException(
        "REPORT_CARD_INVALID_PERIOD",
        400,
        "periodStart must be before or equal to periodEnd",
      );
    }

    // Verify academic session
    const session = await this.prisma.academicSession.findUnique({
      where: { id: dto.academicSessionId },
    });
    if (!session) {
      throw new BusinessException(
        "ACADEMIC_SESSION_NOT_FOUND",
        404,
        "Academic session not found",
      );
    }
    if (session.organizationId !== ctx.organizationId) {
      throw new BusinessException(
        "EDUCATION_CROSS_TENANT_REFERENCE",
        403,
        "Cross-tenant reference not allowed",
      );
    }

    // Verify Section or Batch
    if (dto.sectionId) {
      const section = await this.prisma.section.findUnique({
        where: { id: dto.sectionId },
      });
      if (!section) {
        throw new BusinessException(
          "SECTION_NOT_FOUND",
          404,
          "Section not found",
        );
      }
      if (section.organizationId !== ctx.organizationId) {
        throw new BusinessException(
          "EDUCATION_CROSS_TENANT_REFERENCE",
          403,
          "Cross-tenant reference not allowed",
        );
      }
    }

    if (dto.batchId) {
      const batch = await this.prisma.batch.findUnique({
        where: { id: dto.batchId },
      });
      if (!batch) {
        throw new BusinessException("BATCH_NOT_FOUND", 404, "Batch not found");
      }
      if (batch.organizationId !== ctx.organizationId) {
        throw new BusinessException(
          "EDUCATION_CROSS_TENANT_REFERENCE",
          403,
          "Cross-tenant reference not allowed",
        );
      }
    }

    // Grading scale lookup
    let gradingScale: any;
    if (dto.gradingScaleId) {
      gradingScale = await this.prisma.gradingScale.findUnique({
        where: { id: dto.gradingScaleId },
        include: { bands: true },
      });
      if (!gradingScale || gradingScale.organizationId !== ctx.organizationId) {
        throw new BusinessException(
          "GRADING_SCALE_NOT_FOUND",
          404,
          "Grading scale not found",
        );
      }
    } else {
      gradingScale = await this.prisma.gradingScale.findFirst({
        where: {
          organizationId: ctx.organizationId,
          status: "ACTIVE",
        },
        include: { bands: true },
      });
      if (!gradingScale) {
        throw new BusinessException(
          "GRADING_SCALE_NOT_FOUND",
          400,
          "No active grading scale found for organization",
        );
      }
    }

    // Find student enrollments
    const enrollmentWhere: Prisma.StudentEnrollmentWhereInput = {
      organizationId: ctx.organizationId,
      startDate: { lte: periodEnd },
      OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
      ...(dto.sectionId
        ? {
            placementType: "SCHOOL",
            schoolPlacement: { sectionId: dto.sectionId },
          }
        : {
            placementType: "TUITION",
            tuitionPlacement: { batchId: dto.batchId },
          }),
    };

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: enrollmentWhere,
      include: { student: true },
    });

    if (enrollments.length === 0) {
      return [];
    }

    const enrollmentIds = enrollments.map((e) => e.id);

    // Find assessments and historical results within periodStart and periodEnd
    const subjectOfferingWhere: Prisma.SubjectOfferingWhereInput = dto.sectionId
      ? { schoolOffering: { sectionId: dto.sectionId } }
      : { tuitionOffering: { batchId: dto.batchId } };

    const assessments = await this.prisma.assessment.findMany({
      where: {
        organizationId: ctx.organizationId,
        assessmentDate: {
          gte: periodStart,
          lte: periodEnd,
        },
        subjectOffering: subjectOfferingWhere,
      },
      include: {
        subjectOffering: {
          include: {
            subject: true,
          },
        },
        results: {
          where: {
            studentEnrollmentId: {
              in: enrollmentIds,
            },
          },
        },
      },
    });

    // Group assessments by subject
    const subjectAssessmentsMap = new Map<
      string,
      {
        subjectId: string;
        subjectName: string;
        subjectCode: string;
        assessments: typeof assessments;
      }
    >();

    for (const assessment of assessments) {
      const subject = assessment.subjectOffering.subject;
      if (!subjectAssessmentsMap.has(subject.id)) {
        subjectAssessmentsMap.set(subject.id, {
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code,
          assessments: [],
        });
      }
      subjectAssessmentsMap.get(subject.id)!.assessments.push(assessment);
    }

    const reportCards: ReportCard[] = [];

    // Process each student enrollment
    for (const enrollment of enrollments) {
      const subjectResultsData: Array<{
        subjectId: string;
        subjectName: string;
        subjectCode: string;
        obtainedMarks: Prisma.Decimal;
        maximumMarks: Prisma.Decimal;
        percentage: Prisma.Decimal;
        gradeCode: string | null;
        gradeName: string | null;
        isPassing: boolean;
        isExempt: boolean;
        isAbsent: boolean;
      }> = [];

      for (const [_, subjData] of subjectAssessmentsMap.entries()) {
        let obtained = 0;
        let maximum = 0;
        let hasAnyResult = false;
        let allExempt = true;
        let allAbsent = true;

        for (const assessment of subjData.assessments) {
          const result = assessment.results.find(
            (r) => r.studentEnrollmentId === enrollment.id,
          );

          if (result) {
            hasAnyResult = true;
            if (result.resultStatus === "GRADED") {
              allExempt = false;
              allAbsent = false;
              obtained += Number(result.marksObtained ?? 0);
              maximum += Number(assessment.maximumMarks);
            } else if (result.resultStatus === "ABSENT") {
              allExempt = false;
              obtained += 0;
              maximum += Number(assessment.maximumMarks);
            } else if (result.resultStatus === "EXEMPT") {
              allAbsent = false;
              obtained += 0;
              maximum += 0;
            }
          }
        }

        if (!hasAnyResult) {
          // No results recorded for this student on this subject
          continue;
        }

        const isExempt = allExempt;
        const isAbsent = allAbsent;
        const percentage =
          maximum > 0
            ? Number(((obtained / maximum) * 100).toFixed(2))
            : 0;

        let gradeCode: string | null = null;
        let gradeName: string | null = null;
        let isPassing = false;

        if (isExempt) {
          isPassing = true;
          gradeCode = null;
          gradeName = null;
        } else {
          const band = this.matchBand(gradingScale.bands, percentage);
          gradeCode = band ? band.code : null;
          gradeName = band ? band.name : null;
          isPassing = band ? band.isPassing : false;
        }

        subjectResultsData.push({
          subjectId: subjData.subjectId,
          subjectName: subjData.subjectName,
          subjectCode: subjData.subjectCode,
          obtainedMarks: new Decimal(obtained),
          maximumMarks: new Decimal(maximum),
          percentage: new Decimal(percentage),
          gradeCode,
          gradeName,
          isPassing,
          isExempt,
          isAbsent,
        });
      }

      // Calculate total marks and overall percentage
      let totalObtained = 0;
      let totalMaximum = 0;

      for (const sr of subjectResultsData) {
        totalObtained += Number(sr.obtainedMarks);
        totalMaximum += Number(sr.maximumMarks);
      }

      const overallPercentage =
        totalMaximum > 0
          ? Number(((totalObtained / totalMaximum) * 100).toFixed(2))
          : 0;

      const overallBand = this.matchBand(gradingScale.bands, overallPercentage);
      const overallGradeCode = overallBand ? overallBand.code : null;
      const overallGradeName = overallBand ? overallBand.name : null;

      // Determine Overall PassStatus
      // Rule: PASS if overall percentage matches a passing band and NO subject has FAIL. If all EXEMPT, NOT_GRADED.
      let passStatus: ReportCardPassStatus = ReportCardPassStatus.NOT_GRADED;

      if (subjectResultsData.length > 0) {
        const allSubjectsExempt = subjectResultsData.every((s) => s.isExempt);
        if (allSubjectsExempt) {
          passStatus = ReportCardPassStatus.NOT_GRADED;
        } else {
          const isOverallPassing = overallBand ? overallBand.isPassing : false;
          const anySubjectFailed = subjectResultsData.some(
            (s) => !s.isExempt && !s.isPassing,
          );

          if (isOverallPassing && !anySubjectFailed) {
            passStatus = ReportCardPassStatus.PASS;
          } else {
            passStatus = ReportCardPassStatus.FAIL;
          }
        }
      }

      // Check for existing report card for student + academicSession + period
      const existing = await this.prisma.reportCard.findFirst({
        where: {
          organizationId: ctx.organizationId,
          studentEnrollmentId: enrollment.id,
          academicSessionId: dto.academicSessionId,
          periodStart,
          periodEnd,
        },
      });

      let savedCard: any;

      if (existing) {
        if (existing.status === ReportCardStatus.PUBLISHED) {
          // Already published, preserve it
          savedCard = await this.prisma.reportCard.findUnique({
            where: { id: existing.id },
            include: { subjectResults: true },
          });
        } else {
          // Update existing draft
          savedCard = await this.prisma.$transaction(async (tx) => {
            await tx.reportCardSubjectResult.deleteMany({
              where: { reportCardId: existing.id },
            });

            return tx.reportCard.update({
              where: { id: existing.id },
              data: {
                title: dto.title,
                sectionId: dto.sectionId ?? null,
                batchId: dto.batchId ?? null,
                passStatus,
                totalObtainedMarks: new Decimal(totalObtained),
                totalMaximumMarks: new Decimal(totalMaximum),
                percentage: new Decimal(overallPercentage),
                overallGradeCode,
                overallGradeName,
                subjectResults: {
                  create: subjectResultsData,
                },
              },
              include: { subjectResults: true },
            });
          });
        }
      } else {
        // Create new draft report card
        savedCard = await this.prisma.reportCard.create({
          data: {
            organizationId: ctx.organizationId,
            academicSessionId: dto.academicSessionId,
            studentEnrollmentId: enrollment.id,
            sectionId: dto.sectionId ?? null,
            batchId: dto.batchId ?? null,
            title: dto.title,
            periodStart,
            periodEnd,
            status: ReportCardStatus.DRAFT,
            passStatus,
            totalObtainedMarks: new Decimal(totalObtained),
            totalMaximumMarks: new Decimal(totalMaximum),
            percentage: new Decimal(overallPercentage),
            overallGradeCode,
            overallGradeName,
            subjectResults: {
              create: subjectResultsData,
            },
          },
          include: { subjectResults: true },
        });
      }

      reportCards.push(this.mapReportCard(savedCard));
    }

    return reportCards;
  }

  async publish(
    ctx: TenantContext,
    dto: PublishReportCardsDto,
  ): Promise<ReportCard[]> {
    const publishedCards: ReportCard[] = [];

    for (const reportCardId of dto.reportCardIds) {
      const card = await this.prisma.$transaction(async (tx) => {
        // Use raw query with FOR UPDATE as strictly required
        const rows = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM "ReportCard" 
          WHERE id = ${reportCardId}::uuid AND "organizationId" = ${ctx.organizationId}::uuid 
          FOR UPDATE
        `;

        if (!rows || rows.length === 0) {
          throw new BusinessException(
            "REPORT_CARD_NOT_FOUND",
            404,
            `Report card ${reportCardId} not found`,
          );
        }

        const existing = await tx.reportCard.findUnique({
          where: { id: reportCardId },
          include: { subjectResults: true },
        });

        if (!existing) {
          throw new BusinessException(
            "REPORT_CARD_NOT_FOUND",
            404,
            `Report card ${reportCardId} not found`,
          );
        }

        if (existing.status === ReportCardStatus.PUBLISHED) {
          return existing;
        }

        return tx.reportCard.update({
          where: { id: reportCardId },
          data: {
            status: ReportCardStatus.PUBLISHED,
            publishedAt: new Date(),
          },
          include: {
            subjectResults: true,
          },
        });
      });

      publishedCards.push(this.mapReportCard(card));
    }

    return publishedCards;
  }

  async findById(ctx: TenantContext, id: string): Promise<ReportCard> {
    const card = await this.prisma.reportCard.findUnique({
      where: { id },
      include: {
        subjectResults: {
          include: {
            subject: true,
          },
        },
        studentEnrollment: {
          include: {
            student: true,
          },
        },
        section: true,
        batch: true,
      },
    });

    if (!card) {
      throw new BusinessException(
        "REPORT_CARD_NOT_FOUND",
        404,
        "Report card not found",
      );
    }

    if (card.organizationId !== ctx.organizationId) {
      throw new BusinessException(
        "EDUCATION_CROSS_TENANT_REFERENCE",
        403,
        "Cross-tenant reference not allowed",
      );
    }

    return this.mapReportCard(card);
  }

  async findBySection(
    ctx: TenantContext,
    sectionId: string,
    status?: ReportCardStatus,
  ): Promise<ReportCard[]> {
    const cards = await this.prisma.reportCard.findMany({
      where: {
        organizationId: ctx.organizationId,
        sectionId,
        ...(status ? { status } : {}),
      },
      include: {
        subjectResults: true,
        studentEnrollment: {
          include: {
            student: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return cards.map((c) => this.mapReportCard(c));
  }

  async findByBatch(
    ctx: TenantContext,
    batchId: string,
    status?: ReportCardStatus,
  ): Promise<ReportCard[]> {
    const cards = await this.prisma.reportCard.findMany({
      where: {
        organizationId: ctx.organizationId,
        batchId,
        ...(status ? { status } : {}),
      },
      include: {
        subjectResults: true,
        studentEnrollment: {
          include: {
            student: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return cards.map((c) => this.mapReportCard(c));
  }

  async findByStudent(
    ctx: TenantContext,
    studentId: string,
  ): Promise<ReportCard[]> {
    const cards = await this.prisma.reportCard.findMany({
      where: {
        organizationId: ctx.organizationId,
        studentEnrollment: {
          studentId,
        },
      },
      include: {
        subjectResults: true,
        studentEnrollment: {
          include: {
            student: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return cards.map((c) => this.mapReportCard(c));
  }
}
