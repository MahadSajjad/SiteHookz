import { z } from "zod";

export const createSchoolSubjectOfferingSchema = z.object({
  subjectId: z.string().uuid(),
  sectionId: z.string().uuid(),
});

export type CreateSchoolSubjectOfferingDto = z.infer<typeof createSchoolSubjectOfferingSchema>;

export const createTuitionSubjectOfferingSchema = z.object({
  subjectId: z.string().uuid(),
  batchId: z.string().uuid(),
});

export type CreateTuitionSubjectOfferingDto = z.infer<typeof createTuitionSubjectOfferingSchema>;
