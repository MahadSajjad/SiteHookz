import { Controller, Get } from '@nestjs/common';
import { RequirePermission } from './permission.guard';

@Controller('permissions')
export class PermissionsController {
  @RequirePermission('platform.permissions.read')
  @Get()
  getPermissions() {
    return [
      { key: 'platform.organization.read', name: 'Read Organization' },
      { key: 'platform.organization.update', name: 'Update Organization' },
      { key: 'platform.branches.read', name: 'Read Branches' },
      { key: 'platform.branches.create', name: 'Create Branches' },
      // Return predefined list of permissions
    ];
  }
}
