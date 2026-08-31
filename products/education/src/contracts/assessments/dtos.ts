import { z } from "zod";
import {
  AssessmentResultStatus,
  AssessmentStatus,
  AssessmentType,
} from "./models";

export const CreateAssessmentSchema = z.object({
  subjectOfferingId: z.string().uuid(),
  title: z.string().min(1).max(255),
  assessmentType: z.nativeEnum(AssessmentType),
  assessmentDate: z.string().datetime().or(z.date()),
  maximumMarks: z.string().regex(/^\d+(\.\d{1,2})?$/),
  passingMarks: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional()
    .nullable(),
  description: z.string().optional().nullable(),
});
export type CreateAssessment = z.infer<typeof CreateAssessmentSchema>;

export const UpdateAssessmentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  assessmentType: z.nativeEnum(AssessmentType).optional(),
  assessmentDate: z.string().datetime().or(z.date()).optional(),
  maximumMarks: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  passingMarks: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional()
    .nullable(),
  description: z.string().optional().nullable(),
});
export type UpdateAssessment = z.infer<typeof UpdateAssessmentSchema>;

export const BulkAssessmentResultsSchema = z.object({
  results: z.array(
    z.object({
      studentEnrollmentId: z.string().uuid(),
      resultStatus: z.nativeEnum(AssessmentResultStatus),
      marksObtained: z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/)
        .optional()
        .nullable(),
      comment: z.string().optional().nullable(),
    }),
  ),
});
export type BulkAssessmentResults = z.infer<typeof BulkAssessmentResultsSchema>;

export const AssessmentRosterItemSchema = z.object({
  studentEnrollmentId: z.string().uuid(),
  studentId: z.string().uuid(),
  studentName: z.string(),
  rollNumber: z.string().nullable(),
  resultStatus: z.nativeEnum(AssessmentResultStatus).nullable(),
  marksObtained: z.string().nullable(),
  comment: z.string().nullable(),
  gradedByName: z.string().nullable(),
  gradedAt: z.date().or(z.string().datetime()).nullable(),
});
export type AssessmentRosterItem = z.infer<typeof AssessmentRosterItemSchema>;

export const StudentAssessmentHistorySchema = z.object({
  assessmentId: z.string().uuid(),
  title: z.string(),
  assessmentType: z.nativeEnum(AssessmentType),
  assessmentDate: z.date().or(z.string().datetime()),
  maximumMarks: z.string(),
  passingMarks: z.string().nullable(),
  status: z.nativeEnum(AssessmentStatus),
  resultStatus: z.nativeEnum(AssessmentResultStatus),
  marksObtained: z.string().nullable(),
  percentage: z.number().nullable(),
  passStatus: z.boolean().nullable(),
  comment: z.string().nullable(),
  gradedAt: z.date().or(z.string().datetime()),
  subjectName: z.string(),
});
export type StudentAssessmentHistory = z.infer<
  typeof StudentAssessmentHistorySchema
>;
