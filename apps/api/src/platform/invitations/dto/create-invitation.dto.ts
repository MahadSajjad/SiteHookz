import { z } from 'zod';

export const createInvitationSchema = z.object({
  email: z.string().email(),
  roleAssignments: z.array(z.object({
    roleId: z.string().uuid(),
    branchId: z.string().uuid().optional().nullable(),
  })).min(1),
});

export type CreateInvitationDto = z.infer<typeof createInvitationSchema>;
