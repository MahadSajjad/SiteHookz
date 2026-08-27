import { Controller, Get, Post, Param } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { RequirePermission } from '../authorization/permission.guard';

@Controller('memberships')
export class MembershipsController {
  constructor(private membershipsService: MembershipsService) {}

  @RequirePermission('platform.memberships.read')
  @Get()
  async findAll(@TenantContext() tenant: any) {
    return this.membershipsService.findAll(tenant.organizationId);
  }

  @RequirePermission('platform.memberships.read')
  @Get(':id')
  async getById(@TenantContext() tenant: any, @Param('id') id: string) {
    return this.membershipsService.getById(tenant.organizationId, id);
  }

  @RequirePermission('platform.memberships.suspend')
  @Post(':id/suspend')
  async suspend(@TenantContext() tenant: any, @Param('id') id: string) {
    await this.membershipsService.suspend(tenant.organizationId, id, tenant.membershipId);
    return { success: true };
  }

  @RequirePermission('platform.memberships.update')
  @Post(':id/reactivate')
  async reactivate(@TenantContext() tenant: any, @Param('id') id: string) {
    await this.membershipsService.reactivate(tenant.organizationId, id);
    return { success: true };
  }
}
