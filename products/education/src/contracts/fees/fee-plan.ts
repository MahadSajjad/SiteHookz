import { z } from "zod";

export enum FeePlanType {
  SCHOOL = "SCHOOL",
  TUITION = "TUITION",
}

export enum FeePlanStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export enum FeeFrequency {
  ONE_TIME = "ONE_TIME",
  MONTHLY = "MONTHLY",
}

export const SchoolFeePlanContextSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  feePlanId: z.string().uuid(),
  academicSessionId: z.string().uuid(),
  branchId: z.string().uuid(),
  classLevelId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type SchoolFeePlanContext = z.infer<typeof SchoolFeePlanContextSchema>;

export const TuitionFeePlanContextSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  feePlanId: z.string().uuid(),
  batchId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TuitionFeePlanContext = z.infer<typeof TuitionFeePlanContextSchema>;

export const FeePlanItemSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  feePlanId: z.string().uuid(),
  feeHeadId: z.string().uuid(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  frequency: z.nativeEnum(FeeFrequency),
  description: z.string().nullable().optional(),
  sortOrder: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type FeePlanItem = z.infer<typeof FeePlanItemSchema>;

export const FeePlanSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(255),
  planType: z.nativeEnum(FeePlanType),
  status: z.nativeEnum(FeePlanStatus),
  defaultDueDay: z.number().nullable().optional(),
  archivedAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  schoolContext: SchoolFeePlanContextSchema.optional().nullable(),
  tuitionContext: TuitionFeePlanContextSchema.optional().nullable(),
  items: z.array(FeePlanItemSchema).optional(),
});

export type FeePlan = z.infer<typeof FeePlanSchema>;

export const CreateFeePlanItemDtoSchema = z.object({
  feeHeadId: z.string().uuid(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  frequency: z.nativeEnum(FeeFrequency),
  description: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
});

export type CreateFeePlanItemDto = z.infer<typeof CreateFeePlanItemDtoSchema>;

export const CreateSchoolFeePlanContextDtoSchema = z.object({
  academicSessionId: z.string().uuid(),
  branchId: z.string().uuid(),
  classLevelId: z.string().uuid(),
});

export const CreateTuitionFeePlanContextDtoSchema = z.object({
  batchId: z.string().uuid(),
});

export const CreateFeePlanDtoSchema = z.object({
  name: z.string().min(1).max(255),
  planType: z.nativeEnum(FeePlanType),
  defaultDueDay: z.number().min(1).max(28).optional(),
  schoolContext: CreateSchoolFeePlanContextDtoSchema.optional(),
  tuitionContext: CreateTuitionFeePlanContextDtoSchema.optional(),
  items: z.array(CreateFeePlanItemDtoSchema).optional(),
});

export type CreateFeePlanDto = z.infer<typeof CreateFeePlanDtoSchema>;

export const UpdateFeePlanItemDtoSchema = z.object({
  id: z.string().uuid(),
  feeHeadId: z.string().uuid(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  frequency: z.nativeEnum(FeeFrequency),
  description: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
});

export type UpdateFeePlanItemDto = z.infer<typeof UpdateFeePlanItemDtoSchema>;

export const UpdateFeePlanDtoSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  defaultDueDay: z.number().min(1).max(28).optional(),
  items: z.array(UpdateFeePlanItemDtoSchema).optional(),
});

export type UpdateFeePlanDto = z.infer<typeof UpdateFeePlanDtoSchema>;

export const FeePlanListResponseSchema = z.object({
  data: z.array(FeePlanSchema),
  total: z.number(),
});

export type FeePlanListResponse = z.infer<typeof FeePlanListResponseSchema>;
