import { z } from "zod";

export enum GradingScaleStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export enum ReportCardStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum ReportCardPassStatus {
  PASS = "PASS",
  FAIL = "FAIL",
  EXEMPT = "EXEMPT",
  NOT_GRADED = "NOT_GRADED",
}

export const GradingScaleBandSchema = z.object({
  id: z.string().uuid(),
  gradingScaleId: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().min(1),
  minimumPercentage: z.number().min(0).max(100),
  isPassing: z.boolean(),
  remarks: z.string().nullable().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type GradingScaleBand = z.infer<typeof GradingScaleBandSchema>;

export const GradingScaleSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1),
  status: z.nativeEnum(GradingScaleStatus),
  description: z.string().nullable().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  bands: z.array(GradingScaleBandSchema).optional(),
});

export type GradingScale = z.infer<typeof GradingScaleSchema>;

export const ReportCardSubjectResultSchema = z.object({
  id: z.string().uuid(),
  reportCardId: z.string().uuid(),
  subjectId: z.string().uuid(),
  subjectName: z.string(),
  subjectCode: z.string(),
  obtainedMarks: z.number().min(0),
  maximumMarks: z.number().min(0),
  percentage: z.number().min(0).max(100),
  gradeCode: z.string().nullable().optional(),
  gradeName: z.string().nullable().optional(),
  isPassing: z.boolean(),
  isExempt: z.boolean(),
  isAbsent: z.boolean(),
  remarks: z.string().nullable().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type ReportCardSubjectResult = z.infer<typeof ReportCardSubjectResultSchema>;

export const ReportCardSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  academicSessionId: z.string().uuid(),
  studentEnrollmentId: z.string().uuid(),
  sectionId: z.string().uuid().nullable().optional(),
  batchId: z.string().uuid().nullable().optional(),
  title: z.string(),
  periodStart: z.date().or(z.string()),
  periodEnd: z.date().or(z.string()),
  status: z.nativeEnum(ReportCardStatus),
  passStatus: z.nativeEnum(ReportCardPassStatus),
  totalObtainedMarks: z.number().min(0),
  totalMaximumMarks: z.number().min(0),
  percentage: z.number().min(0).max(100),
  overallGradeCode: z.string().nullable().optional(),
  overallGradeName: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  publishedAt: z.date().or(z.string()).nullable().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  subjectResults: z.array(ReportCardSubjectResultSchema).optional(),
});

export type ReportCard = z.infer<typeof ReportCardSchema>;
