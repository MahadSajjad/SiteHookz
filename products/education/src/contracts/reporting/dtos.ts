import { z } from "zod";
import { GradingScaleStatus } from "./models";

export const CreateGradingScaleBandSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  minimumPercentage: z.number().min(0).max(100),
  isPassing: z.boolean(),
  remarks: z.string().max(500).optional(),
});
export const CreateGradingScaleBandDto = CreateGradingScaleBandSchema;
export type CreateGradingScaleBandDto = z.infer<typeof CreateGradingScaleBandSchema>;

export const CreateGradingScaleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  bands: z.array(CreateGradingScaleBandSchema).min(1, "At least one band is required"),
});
export const CreateGradingScaleDto = CreateGradingScaleSchema;
export type CreateGradingScaleDto = z.infer<typeof CreateGradingScaleSchema>;

export const UpdateGradingScaleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.nativeEnum(GradingScaleStatus).optional(),
  bands: z.array(CreateGradingScaleBandSchema).optional(),
});
export const UpdateGradingScaleDto = UpdateGradingScaleSchema;
export type UpdateGradingScaleDto = z.infer<typeof UpdateGradingScaleSchema>;

export const GenerateReportCardsSchema = z.object({
  title: z.string().min(1).max(100),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  academicSessionId: z.string().uuid(),
  sectionId: z.string().uuid().optional(),
  batchId: z.string().uuid().optional(),
  gradingScaleId: z.string().uuid().optional(),
}).refine(data => data.sectionId || data.batchId, {
  message: "Either sectionId or batchId must be provided",
  path: ["sectionId", "batchId"],
});
export const GenerateReportCardsDto = GenerateReportCardsSchema;
export type GenerateReportCardsDto = z.infer<typeof GenerateReportCardsSchema>;

export const PublishReportCardsSchema = z.object({
  reportCardIds: z.array(z.string().uuid()).min(1),
});
export const PublishReportCardsDto = PublishReportCardsSchema;
export type PublishReportCardsDto = z.infer<typeof PublishReportCardsSchema>;

