import { z } from "zod";

export const endTeachingAssignmentSchema = z.object({
  endDate: z.string().datetime().optional().nullable(),
});

export type EndTeachingAssignmentDto = z.infer<typeof endTeachingAssignmentSchema>;
