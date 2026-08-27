import { z } from 'zod';

export const createBranchSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
});

export type CreateBranchDto = z.infer<typeof createBranchSchema>;
