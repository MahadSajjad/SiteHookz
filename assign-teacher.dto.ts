import { z } from "zod";

export const assignTeacherSchema = z.object({
  staffMemberId: z.string().uuid(),
  startDate: z.string().datetime().optional().nullable(),
});

export type AssignTeacherDto = z.infer<typeof assignTeacherSchema>;
