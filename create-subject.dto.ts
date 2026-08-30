import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().max(20).optional(),
  description: z.string().max(500).optional(),
});

export type CreateSubjectDto = z.infer<typeof createSubjectSchema>;
