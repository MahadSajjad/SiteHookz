import { z } from "zod";

export enum AssessmentType {
  QUIZ = "QUIZ",
  ASSIGNMENT = "ASSIGNMENT",
  TEST = "TEST",
  MIDTERM = "MIDTERM",
  FINAL = "FINAL",
  PRACTICAL = "PRACTICAL",
  OTHER = "OTHER",
}

export enum AssessmentStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  RESULTS_PUBLISHED = "RESULTS_PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum AssessmentResultStatus {
  GRADED = "GRADED",
  ABSENT = "ABSENT",
  EXEMPT = "EXEMPT",
}

export const AssessmentSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  subjectOfferingId: z.string().uuid(),
  title: z.string(),
  assessmentType: z.nativeEnum(AssessmentType),
  assessmentDate: z.date().or(z.string().datetime()),
  maximumMarks: z.string(), // Decimal string
  passingMarks: z.string().nullable(), // Decimal string
  status: z.nativeEnum(AssessmentStatus),
  description: z.string().nullable(),
  createdByMembershipId: z.string().uuid(),
  activatedAt: z.date().or(z.string().datetime()).nullable(),
  activatedByMembershipId: z.string().uuid().nullable(),
  resultsPublishedAt: z.date().or(z.string().datetime()).nullable(),
  resultsPublishedByMembershipId: z.string().uuid().nullable(),
  archivedAt: z.date().or(z.string().datetime()).nullable(),
  archivedByMembershipId: z.string().uuid().nullable(),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
});
export type Assessment = z.infer<typeof AssessmentSchema>;

export const AssessmentResultSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  studentEnrollmentId: z.string().uuid(),
  resultStatus: z.nativeEnum(AssessmentResultStatus),
  marksObtained: z.string().nullable(), // Decimal string
  comment: z.string().nullable(),
  gradedByMembershipId: z.string().uuid(),
  gradedAt: z.date().or(z.string().datetime()),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
});
export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;
