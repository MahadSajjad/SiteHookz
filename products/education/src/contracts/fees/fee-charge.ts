import { z } from "zod";
import { FeePlanItemSchema } from "./fee-plan";

export const FeeChargeSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  enrollmentFeePlanAssignmentId: z.string().uuid(),
  feePlanItemId: z.string().uuid(),
  studentEnrollmentId: z.string().uuid(),
  branchId: z.string().uuid(),
  billingPeriodKey: z.string(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  dueDate: z.coerce.date(),
  description: z.string().nullable().optional(),
  voidedAt: z.coerce.date().nullable().optional(),
  voidedByMembershipId: z.string().uuid().nullable().optional(),
  voidReason: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  feePlanItem: FeePlanItemSchema.optional(),

  // Computed field from backend
  status: z.enum(["UNPAID", "PARTIALLY_PAID", "PAID", "VOIDED"]).optional(),
  amountPaid: z.string().optional(),
  amountOutstanding: z.string().optional(),
});

export type FeeCharge = z.infer<typeof FeeChargeSchema>;

export const GenerateFeeChargesDtoSchema = z.object({
  billingPeriodKey: z.string(), // e.g. "2026-09"
});

export type GenerateFeeChargesDto = z.infer<typeof GenerateFeeChargesDtoSchema>;

export const VoidFeeChargeDtoSchema = z.object({
  voidReason: z.string().min(1).max(255),
});

export type VoidFeeChargeDto = z.infer<typeof VoidFeeChargeDtoSchema>;

export const FeeChargeListResponseSchema = z.object({
  data: z.array(FeeChargeSchema),
  total: z.number(),
});

export type FeeChargeListResponse = z.infer<typeof FeeChargeListResponseSchema>;
