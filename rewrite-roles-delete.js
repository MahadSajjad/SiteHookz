const fs = require('fs');
let rs = fs.readFileSync('apps/api/src/platform/roles/roles.service.ts', 'utf8');

const regex = /async delete\(organizationId: string, roleId: string\) {[\s\S]*?return { success: true };\n  }/;

const replacement = `async delete(organizationId: string, roleId: string) {
    const role = await this.prisma.role.findFirst({ 
      where: { id: roleId, organizationId },
      include: {
        _count: {
          select: {
            roleAssignments: true,
            invitationRoleAssignments: true
          }
        }
      }
    });
    
    if (!role) {
      throw new BusinessException('ROLE_NOT_FOUND', 404, 'Role not found');
    }
    
    if (role.type === 'SYSTEM' || !role.isDeletable) {
      throw new BusinessException('ROLE_SYSTEM_PROTECTED', 403, 'Cannot delete system or protected role');
    }

    if (role._count.roleAssignments > 0 || role._count.invitationRoleAssignments > 0) {
      throw new BusinessException('ROLE_IN_USE', 409, 'Role is currently in use by active members or pending invitations');
    }

    await this.prisma.role.delete({ where: { id: roleId } });
    return { success: true };
  }`;

rs = rs.replace(regex, replacement);
fs.writeFileSync('apps/api/src/platform/roles/roles.service.ts', rs, 'utf8');
