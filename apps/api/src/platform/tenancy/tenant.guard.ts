import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { TenantResolverService } from './tenant-resolver.service';
import { BusinessException } from '../../common/exceptions/business.exception';

export const SKIP_TENANT_KEY = 'skipTenant';
export const SkipTenant = () => SetMetadata(SKIP_TENANT_KEY, true);

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
    
    // Skip if no user is authenticated (public routes)
    if (!request.user) {
      return true; 
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
          include: { role: true }
        }
      }
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw new BusinessException('TENANT_ACCESS_DENIED', 403, 'User does not have active membership in this organization');
    }

    // Attach to request
    request.tenantContext = {
      organization,
      membership,
      // branch context could be resolved here if x-sitehookz-branch header is provided
    };
    
    return true;
  }
}
