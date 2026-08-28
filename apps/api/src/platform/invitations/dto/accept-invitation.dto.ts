import { z } from "zod";

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type AcceptInvitationDto = z.infer<typeof acceptInvitationSchema>;
