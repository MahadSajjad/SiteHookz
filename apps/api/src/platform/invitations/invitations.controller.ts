import { Controller, Post, Body } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { RequirePermission } from '../authorization/permission.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('invitations')
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @RequirePermission('platform.invitations.create')
  @Post()
  async create(@TenantContext() tenant: any, @Body() dto: any) {
    return this.invitationsService.create(tenant.organizationId, dto);
  }

  @Public()
  @Post('accept')
  async accept(@Body('token') token: string) {
    return this.invitationsService.accept(token);
  }
}
