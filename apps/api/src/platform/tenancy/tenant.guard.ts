import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

export const SKIP_TENANT_KEY = 'skipTenant';
export const SkipTenant = () => import('@nestjs/common').then(m => m.SetMetadata(SKIP_TENANT_KEY, true));

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
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
    // In a real implementation, we would extract the tenant from the host/header,
    // look up the membership, and set `request.tenantContext = { ... }`.
    
    return true; // Simplified for initial skeleton
  }
}
