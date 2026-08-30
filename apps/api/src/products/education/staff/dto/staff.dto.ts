import { StaffPositionCategory } from "@sitehookz/database";
import { z } from "zod";

export const createStaffSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  employeeNumber: z.string().optional().nullable(),
});

export const createPositionSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  category: z.nativeEnum(StaffPositionCategory).optional().nullable(),
  description: z.string().optional().nullable(),
});

export const assignBranchSchema = z.object({
  branchId: z.string().uuid(),
  positionId: z.string().uuid(),
  startDate: z.string().datetime(),
  isPrimary: z.boolean().default(false),
});
