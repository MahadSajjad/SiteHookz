import { Controller, Post, Body, Req } from '@nestjs/common';
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
    return this.invitationsService.create(tenant.organization.id, dto, tenant.membership.id);
  }

  @Post('accept')
  async accept(@Body('token') token: string, @Req() req: any) {
    return this.invitationsService.accept(token, req.user.userAccountId);
  }
}
