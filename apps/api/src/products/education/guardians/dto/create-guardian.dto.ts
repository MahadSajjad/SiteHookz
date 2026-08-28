import { z } from "zod";
import { GuardianRelationship } from "@sitehookz/database";

export const createGuardianSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  alternatePhone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  nationalId: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  employer: z.string().optional().nullable(),
});
export type CreateGuardianDto = z.infer<typeof createGuardianSchema>;
export const updateGuardianSchema = createGuardianSchema.partial();
export type UpdateGuardianDto = z.infer<typeof updateGuardianSchema>;

export const linkGuardianSchema = z.object({
  guardianId: z.string().uuid(),
  relationship: z.nativeEnum(GuardianRelationship),
  isPrimary: z.boolean().default(false),
});
export type LinkGuardianDto = z.infer<typeof linkGuardianSchema>;
