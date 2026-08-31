import { z } from "zod";

export const EnrollmentFeePlanAssignmentSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  studentEnrollmentId: z.string().uuid(),
  feePlanId: z.string().uuid(),
  assignedAt: z.coerce.date(),
  assignedByMembershipId: z.string().uuid(),
  endedAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type EnrollmentFeePlanAssignment = z.infer<
  typeof EnrollmentFeePlanAssignmentSchema
>;

export const CreateEnrollmentFeePlanAssignmentDtoSchema = z.object({
  studentEnrollmentId: z.string().uuid(),
  feePlanId: z.string().uuid(),
});

export type CreateEnrollmentFeePlanAssignmentDto = z.infer<
  typeof CreateEnrollmentFeePlanAssignmentDtoSchema
>;

export const EnrollmentFeePlanAssignmentListResponseSchema = z.object({
  data: z.array(EnrollmentFeePlanAssignmentSchema),
  total: z.number(),
});

export type EnrollmentFeePlanAssignmentListResponse = z.infer<
  typeof EnrollmentFeePlanAssignmentListResponseSchema
>;
