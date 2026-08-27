import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class AuthorizationService {
  constructor(private prisma: PrismaService) {}

  hasPermission(tenantContext: any, permission: string, branchId?: string): boolean {
    return tenantContext.roleAssignments.some((assignment: any) => {
      const hasPerm = assignment.permissions.includes(permission);
      if (!hasPerm) return false;
      
      if (assignment.roleScopeType === 'ORGANIZATION') return true;
      if (assignment.roleScopeType === 'BRANCH' && branchId && assignment.branchId === branchId) return true;
      
      return false;
    });
  }

  getAccessibleBranchIds(tenantContext: any): string[] {
    return tenantContext.accessibleBranchIds || [];
  }
}
