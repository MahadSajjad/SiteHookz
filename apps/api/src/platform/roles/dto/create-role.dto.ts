import { z } from 'zod';
import { RoleScopeType } from '@sitehookz/database';

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  key: z.string().min(1, 'Role key is required'),
  scopeType: z.nativeEnum(RoleScopeType),
  permissions: z.array(z.string()).optional()
});

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
