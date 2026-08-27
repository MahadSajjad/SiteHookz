import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { SKIP_TENANT_KEY } from '../tenancy/tenant.guard';
import { BusinessException } from '../../common/exceptions/business.exception';

export const REQUIRE_PERMISSION_KEY = 'requirePermission';
export const RequirePermission = (permission: string) => SetMetadata(REQUIRE_PERMISSION_KEY, permission);

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermission = this.reflector.getAllAndOverride<string>(REQUIRE_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermission) {
      return true; // No specific permission required
    }

    const request = context.switchToHttp().getRequest();
    const tenantContext = request.tenantContext;

    if (!tenantContext) {
      throw new BusinessException('PERMISSION_DENIED', 403, 'Tenant context required for permission check');
    }

    // Simplified permission check
    const hasPermission = tenantContext.roleAssignments.some((assignment: any) => 
      assignment.permissions.includes(requiredPermission)
    );

    if (!hasPermission) {
      throw new BusinessException('PERMISSION_DENIED', 403, 'Insufficient permissions');
    }

    return true;
  }
}
