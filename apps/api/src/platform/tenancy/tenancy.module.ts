import { Module, Global } from "@nestjs/common";
import { TenantResolverService } from "./tenant-resolver.service";
import { TenantGuard } from "./tenant.guard";

@Global()
@Module({
  providers: [TenantResolverService, TenantGuard],
  exports: [TenantResolverService, TenantGuard],
})
export class TenancyModule {}
