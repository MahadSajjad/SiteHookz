import { Gender, StudentStatus } from "@sitehookz/database";
import { z } from "zod";

export const createStudentSchema = z.object({
  firstName: z.string().min(1).max(255),
  middleName: z.string().max(255).optional().nullable(),
  lastName: z.string().max(255).optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().optional().nullable(),
  admissionDate: z.string().datetime().optional().nullable(),
  admissionBranchId: z.string().uuid().optional().nullable(),
  status: z.nativeEnum(StudentStatus).optional().default(StudentStatus.ACTIVE),
});

export type CreateStudentDto = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = createStudentSchema.partial();
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
