import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { BusinessException } from '../../common/exceptions/business.exception';
import { AuthorizationService } from './authorization.service';
import { TenantContext } from '../tenancy/tenant.guard';

export const REQUIRE_PERMISSION_KEY = 'requirePermission';
export const RequirePermission = (permission: string) => SetMetadata(REQUIRE_PERMISSION_KEY, permission);

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authorizationService: AuthorizationService
  ) {}

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
    const tenantContext = request.tenantContext as TenantContext;

    if (!tenantContext) {
      throw new BusinessException('PERMISSION_DENIED', 403, 'Tenant context required for permission check');
    }

    // Attempt to extract branchId from headers or params for more granular scope checks at the guard level
    // Fallback to basic hasPermission which will only pass if they have ORGANIZATION scope or no branch is needed
    // In a fully developed app, you might want a custom decorator for branch-aware routes.
    const branchId = request.headers['x-sitehookz-branch'] || request.params?.branchId || request.body?.branchId;

    if (!this.authorizationService.hasPermission(tenantContext, requiredPermission, branchId)) {
      throw new BusinessException('PERMISSION_DENIED', 403, 'Insufficient permissions');
    }

    return true;
  }
}
