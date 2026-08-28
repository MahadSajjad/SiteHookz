import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { TenantResolverService } from './tenant-resolver.service';
import { BusinessException } from '../../common/exceptions/business.exception';
import { RoleScopeType } from '@sitehookz/database';

export const SKIP_TENANT_KEY = 'skipTenant';
export const SkipTenant = () => SetMetadata(SKIP_TENANT_KEY, true);

export type TenantContext = {
  organizationId: string;
  organizationSlug: string;
  userAccountId: string;
  membershipId: string;
  assignments: Array<{
    roleId: string;
    roleKey: string;
    scopeType: RoleScopeType;
    branchId: string | null;
    permissions: string[];
  }>;
};

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tenantResolver: TenantResolverService,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const skipTenant = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic || skipTenant) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    // Fail closed if no user is authenticated
    if (!request.user) {
      throw new BusinessException('AUTH_REQUIRED', 401, 'Unauthorized');
    }

    // Resolve Organization
    const organization = await this.tenantResolver.resolveTenant(request);

    // Resolve ACTIVE OrganizationMembership
    const membership = await this.prisma.organizationMembership.findUnique({
      where: {
        organizationId_userAccountId: {
          organizationId: organization.id,
          userAccountId: request.user.userAccountId,
        }
      },
      include: {
        roleAssignments: {
          include: { 
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw new BusinessException('TENANT_ACCESS_DENIED', 403, 'User does not have active membership in this organization');
    }

    // Build the normalized TenantContext
    const tenantContext: TenantContext = {
      organizationId: organization.id,
      organizationSlug: organization.slug,
      userAccountId: request.user.userAccountId,
      membershipId: membership.id,
      assignments: membership.roleAssignments.map(assignment => ({
        roleId: assignment.role.id,
        roleKey: assignment.role.key,
        scopeType: assignment.role.scopeType,
        branchId: assignment.branchId,
        permissions: assignment.role.rolePermissions.map(rp => rp.permission.key)
      }))
    };

    // Attach to request
    request.tenantContext = tenantContext;
    
    return true;
  }
}
