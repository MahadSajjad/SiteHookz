import { z } from "zod";

export const createAcademicSessionSchema = z
  .object({
    name: z.string().min(1).max(100),
    code: z.string().min(1).max(20),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Start date must be before end date",
    path: ["endDate"],
  });

export type CreateAcademicSessionDto = z.infer<
  typeof createAcademicSessionSchema
>;
