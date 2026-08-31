import { z } from 'zod';

export const FeeHeadSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  archivedAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type FeeHead = z.infer<typeof FeeHeadSchema>;

export const CreateFeeHeadDtoSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateFeeHeadDto = z.infer<typeof CreateFeeHeadDtoSchema>;

export const UpdateFeeHeadDtoSchema = CreateFeeHeadDtoSchema.partial();

export type UpdateFeeHeadDto = z.infer<typeof UpdateFeeHeadDtoSchema>;

export const FeeHeadListResponseSchema = z.object({
  data: z.array(FeeHeadSchema),
  total: z.number(),
});

export type FeeHeadListResponse = z.infer<typeof FeeHeadListResponseSchema>;
