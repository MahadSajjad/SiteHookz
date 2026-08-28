const fs = require('fs');
fs.writeFileSync('apps/api/src/platform/auth/auth.service.ts', import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    
    const existing = await this.prisma.userAccount.findUnique({
      where: { email: normalizedEmail }
    });
    
    if (existing) {
      throw new BusinessException('AUTH_EMAIL_TAKEN', 409, 'Email is already taken');
    }

    const passwordHash = await argon2.hash(dto.password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    const user = await this.prisma.(async (tx) => {
      const newUser = await tx.userAccount.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          status: 'ACTIVE',
        }
      });

      await tx.emailVerificationToken.create({
        data: {
          userAccountId: newUser.id,
          tokenHash: hashedToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }
      });

      return newUser;
    });

    await this.mailService.sendVerificationEmail(normalizedEmail, verificationToken);
    return { id: user.id, email: user.email };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const hash = crypto.createHash('sha256').update(dto.token).digest('hex');

    await this.prisma.(async (tx) => {
      const tokenRecord = await tx.emailVerificationToken.findUnique({
        where: { tokenHash: hash },
        include: { userAccount: true }
      });

      if (!tokenRecord) {
        throw new BusinessException('AUTH_INVALID_TOKEN', 400, 'Invalid verification token');
      }

      if (tokenRecord.usedAt) {
        throw new BusinessException('AUTH_TOKEN_USED', 400, 'Token has already been used');
      }

      if (tokenRecord.expiresAt < new Date()) {
        throw new BusinessException('AUTH_TOKEN_EXPIRED', 400, 'Verification token has expired');
      }

      await tx.emailVerificationToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() }
      });

      await tx.userAccount.update({
        where: { id: tokenRecord.userAccountId },
        data: { emailVerifiedAt: new Date() }
      });
    });

    return { success: true };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const user = await this.prisma.userAccount.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      throw new BusinessException('AUTH_INVALID_CREDENTIALS', 401, 'Invalid credentials');
    }

    const validPassword = await argon2.verify(user.passwordHash, dto.password);
    if (!validPassword) {
      throw new BusinessException('AUTH_INVALID_CREDENTIALS', 401, 'Invalid credentials');
    }

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw new BusinessException('AUTH_ACCOUNT_SUSPENDED', 403, 'Account is not active');
    }

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const familyId = crypto.randomUUID();

    await this.prisma.([
      this.prisma.userAccount.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      }),
      this.prisma.authSession.create({
        data: {
          userAccountId: user.id,
          familyId,
          refreshTokenHash: hashedRefreshToken,
          expiresAt,
          ipAddress,
          userAgent,
          lastUsedAt: new Date(),
        }
      })
    ]);

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, emailVerifiedAt: user.emailVerifiedAt } };
  }

  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    const session = await this.prisma.authSession.findUnique({
      where: { refreshTokenHash: hashedRefreshToken },
      include: { userAccount: true }
    });

    if (!session || session.expiresAt < new Date()) {
      throw new BusinessException('AUTH_INVALID_TOKEN', 401, 'Invalid or expired refresh token');
    }

    if (session.revokedAt) {
      await this.prisma.authSession.updateMany({
        where: { familyId: session.familyId, revokedAt: null },
        data: { 
          revokedAt: new Date(), 
          revokeReason: 'REPLAY_DETECTED' 
        }
      });
      throw new BusinessException('AUTH_INVALID_TOKEN', 401, 'Session revoked');
    }

    const user = session.userAccount;
    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw new BusinessException('AUTH_ACCOUNT_SUSPENDED', 403, 'Account is not active');
    }

    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newHashedRefreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newSession = await this.prisma.(async (tx) => {
      const created = await tx.authSession.create({
        data: {
          userAccountId: user.id,
          familyId: session.familyId,
          refreshTokenHash: newHashedRefreshToken,
          expiresAt,
          ipAddress,
          userAgent,
          lastUsedAt: new Date(),
        }
      });

      await tx.authSession.update({
        where: { id: session.id },
        data: {
          revokedAt: new Date(),
          revokeReason: 'ROTATED',
          replacedBySessionId: created.id
        }
      });

      return created;
    });

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });

    return { accessToken, newRefreshToken };
  }

  async logout(refreshToken: string) {
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.authSession.updateMany({
      where: { refreshTokenHash: hashedRefreshToken, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: 'LOGOUT' }
    });
  }

  async logoutAll(userAccountId: string) {
    await this.prisma.authSession.updateMany({
      where: { userAccountId, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: 'LOGOUT_ALL' }
    });
  }

  async forgotPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.userAccount.findUnique({
      where: { email: normalizedEmail }
    });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      
      await this.prisma.(async (tx) => {
        await tx.passwordResetToken.updateMany({
          where: { userAccountId: user.id, usedAt: null },
          data: { usedAt: new Date() }
        });

        await tx.passwordResetToken.create({
          data: {
            userAccountId: user.id,
            tokenHash: hash,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
          }
        });
      });
      await this.mailService.sendPasswordResetEmail(normalizedEmail, token);
    }
  }

  async resetPassword(dto: any) {
    const hash = crypto.createHash('sha256').update(dto.token).digest('hex');
    
    return this.prisma.(async (tx) => {
      const resetToken = await tx.passwordResetToken.findUnique({
        where: { tokenHash: hash }
      });

      if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
        throw new BusinessException('AUTH_INVALID_TOKEN', 400, 'Invalid or expired token');
      }

      const passwordHash = await argon2.hash(dto.newPassword);
      
      await tx.userAccount.update({
        where: { id: resetToken.userAccountId },
        data: { passwordHash }
      });

      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() }
      });

      await tx.authSession.updateMany({
        where: { userAccountId: resetToken.userAccountId, revokedAt: null },
        data: { revokedAt: new Date(), revokeReason: 'PASSWORD_RESET' }
      });

      return { success: true };
    });
  }
}
\);

fs.writeFileSync('apps/api/src/platform/authorization/authorization.service.ts', import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { TenantContext } from '../tenancy/tenant.guard';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class AuthorizationService {
  constructor(private prisma: PrismaService) {}

  hasPermission(tenantContext: TenantContext, permission: string, branchId?: string): boolean {
    return tenantContext.assignments.some(assignment => {
      const hasPerm = assignment.permissions.includes(permission);
      if (!hasPerm) return false;
      
      if (assignment.scopeType === 'ORGANIZATION') return true;
      if (assignment.scopeType === 'BRANCH' && branchId && assignment.branchId === branchId) return true;
      
      return false;
    });
  }

  assertPermission(tenantContext: TenantContext, permission: string, branchId?: string): void {
    if (!this.hasPermission(tenantContext, permission, branchId)) {
      throw new BusinessException('PERMISSION_DENIED', 403, \Insufficient permissions for \\);
    }
  }

  getAccessibleBranchIdsForPermission(tenantContext: TenantContext, permission: string): string[] | 'ALL' {
    const accessibleBranches: string[] = [];

    for (const assignment of tenantContext.assignments) {
      if (assignment.permissions.includes(permission)) {
        if (assignment.scopeType === 'ORGANIZATION') {
          return 'ALL';
        }
        if (assignment.scopeType === 'BRANCH' && assignment.branchId) {
          accessibleBranches.push(assignment.branchId);
        }
      }
    }

    return accessibleBranches;
  }
}
\);

fs.writeFileSync('apps/api/src/platform/invitations/invitations.service.ts', import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { BusinessException } from '../../common/exceptions/business.exception';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService, private mailService: MailService) {}

  async create(organizationId: string, dto: any, invitedByMembershipId: string) {
    const email = dto.email.trim().toLowerCase();
    
    // Validate not member
    const member = await this.prisma.organizationMembership.findFirst({
      where: { organizationId, userAccount: { email } }
    });
    if (member) throw new BusinessException('INVITATION_EMAIL_ALREADY_MEMBER', 400, 'Already a member');

    // Cross-organization integrity check for roles & branches
    if (dto.roleAssignments && dto.roleAssignments.length > 0) {
      for (const assignment of dto.roleAssignments) {
        const role = await this.prisma.role.findFirst({
          where: { id: assignment.roleId, organizationId }
        });
        if (!role) {
          throw new BusinessException('INVALID_ROLE', 400, 'Role does not exist in this organization');
        }

        if (role.scopeType === 'BRANCH') {
          if (!assignment.branchId) {
            throw new BusinessException('MISSING_BRANCH', 400, 'Branch ID is required for branch-scoped roles');
          }
          const branch = await this.prisma.branch.findFirst({
            where: { id: assignment.branchId, organizationId }
          });
          if (!branch) {
            throw new BusinessException('INVALID_BRANCH', 400, 'Branch does not exist in this organization');
          }
        } else {
          if (assignment.branchId) {
            throw new BusinessException('INVALID_SCOPE', 400, 'Branch ID must not be provided for organization-scoped roles');
          }
        }
      }
    }

    // Token generation
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    const invitation = await this.prisma.(async (tx) => {
      const inv = await tx.organizationInvitation.create({
        data: {
          organizationId,
          email,
          tokenHash: hash,
          status: 'PENDING',
          invitedByMembershipId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      if (dto.roleAssignments && dto.roleAssignments.length > 0) {
        await tx.organizationInvitationRoleAssignment.createMany({
          data: dto.roleAssignments.map((a: any) => ({
            invitationId: inv.id,
            roleId: a.roleId,
            branchId: a.branchId || null
          }))
        });
      }

      return inv;
    });

    await this.mailService.sendInvitationEmail(email, token, 'Organization');
    return { id: invitation.id, email: invitation.email };
  }

  async accept(token: string, userAccountId: string) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    
    return this.prisma.(async (tx) => {
      const invitation = await tx.organizationInvitation.findUnique({
        where: { tokenHash: hash },
        include: { roleAssignments: true }
      });

      if (!invitation || invitation.status !== 'PENDING') {
        throw new BusinessException('INVITATION_NOT_FOUND', 404, 'Invalid or consumed invitation');
      }
      
      if (invitation.expiresAt < new Date()) {
        throw new BusinessException('INVITATION_EXPIRED', 400, 'Expired');
      }

      const user = await tx.userAccount.findUnique({ where: { id: userAccountId } });
      if (!user || user.email !== invitation.email) {
        throw new BusinessException('INVITATION_EMAIL_MISMATCH', 400, 'Email mismatch or user not found');
      }

      let membership = await tx.organizationMembership.findUnique({
        where: { organizationId_userAccountId: { organizationId: invitation.organizationId, userAccountId } }
      });

      if (!membership) {
        membership = await tx.organizationMembership.create({
          data: {
            organizationId: invitation.organizationId,
            userAccountId,
            status: 'ACTIVE'
          }
        });
      }

      for (const assignment of invitation.roleAssignments) {
        await tx.roleAssignment.create({
          data: {
            membershipId: membership.id,
            roleId: assignment.roleId,
            branchId: assignment.branchId,
            assignedByMembershipId: invitation.invitedByMembershipId
          }
        });
      }

      await tx.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() }
      });

      return { success: true, organizationId: invitation.organizationId };
    });
  }
}
\);

fs.writeFileSync('apps/api/src/platform/organizations/organizations.service.ts', import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { BusinessException } from '../../common/exceptions/business.exception';

const RESERVED_SLUGS = new Set([
  'www', 'api', 'admin', 'app', 'auth', 'mail', 'smtp', 'cdn', 'status', 'help', 
  'support', 'billing', 'docs', 'static', 'assets', 'system', 'root', 'superadmin', 'platform'
]);

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(userAccountId: string, dto: CreateOrganizationDto) {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userAccountId }
    });

    if (!user || !user.emailVerifiedAt) {
      throw new BusinessException('ORGANIZATION_CREATION_DENIED', 403, 'Email must be verified to create an organization');
    }

    if (RESERVED_SLUGS.has(dto.slug)) {
      throw new BusinessException('ORGANIZATION_SLUG_RESERVED', 400, 'Slug is reserved');
    }

    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug: dto.slug }
    });

    if (existingOrg) {
      throw new BusinessException('ORGANIZATION_SLUG_TAKEN', 409, 'Slug is already in use');
    }

    return this.prisma.(async (tx) => {
      // Create Organization
      const org = await tx.organization.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          status: 'ONBOARDING',
          defaultLocale: dto.defaultLocale,
          timezone: dto.timezone,
          currency: dto.currency,
        }
      });

      // Create Membership for Creator
      const membership = await tx.organizationMembership.create({
        data: {
          organizationId: org.id,
          userAccountId: userAccountId,
          status: 'ACTIVE'
        }
      });

      return org;
    });
  }

  async getMyOrganizations(userAccountId: string) {
    return this.prisma.organization.findMany({
      where: {
        memberships: {
          some: {
            userAccountId,
            status: 'ACTIVE'
          }
        }
      }
    });
  }
}
\);

fs.writeFileSync('apps/api/src/platform/roles/roles.service.ts', import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { BusinessException } from '../../common/exceptions/business.exception';
import { CreateRoleDto } from './dto/create-role.dto';
import { TenantContext } from '../tenancy/tenant.guard';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.role.findMany({ where: { organizationId } });
  }

  async create(tenantContext: TenantContext, dto: CreateRoleDto) {
    const { organizationId } = tenantContext;

    // Normalize role key
    const normalizedKey = dto.key.trim().toLowerCase();

    // Check key uniqueness
    const existing = await this.prisma.role.findUnique({
      where: {
        organizationId_key: {
          organizationId,
          key: normalizedKey,
        }
      }
    });

    if (existing) {
      throw new BusinessException('ROLE_IN_USE', 409, 'Role key is already in use in this organization');
    }

    // Enforce permission escalation ceiling
    if (dto.permissions && dto.permissions.length > 0) {
      // Owner bypass: If user has 'platform.roles.manage_all', they can bypass
      const hasFullControl = tenantContext.assignments.some(
        a => a.scopeType === 'ORGANIZATION' && a.permissions.includes('platform.roles.manage_all')
      );

      if (!hasFullControl) {
        // Otherwise, they can only grant permissions they possess at ORGANIZATION scope 
        // (assuming roles are org-scoped for definition).
        const userOrgPermissions = new Set(
          tenantContext.assignments
            .filter(a => a.scopeType === 'ORGANIZATION')
            .flatMap(a => a.permissions)
        );

        for (const requestedPerm of dto.permissions) {
          if (!userOrgPermissions.has(requestedPerm)) {
            throw new BusinessException(
              'PERMISSION_ESCALATION', 
              403, 
              \Cannot assign permission \ as you do not possess it at the organization scope\
            );
          }
        }
      }
    }

    // We must resolve Permission IDs from keys to create RolePermission records
    let permissionIds: string[] = [];
    if (dto.permissions && dto.permissions.length > 0) {
      const perms = await this.prisma.permission.findMany({
        where: { key: { in: dto.permissions } }
      });
      permissionIds = perms.map(p => p.id);

      if (permissionIds.length !== dto.permissions.length) {
        throw new BusinessException('INVALID_PERMISSION', 400, 'One or more provided permissions are invalid');
      }
    }

    return this.prisma.role.create({
      data: {
        organizationId,
        name: dto.name,
        type: 'CUSTOM',
        scopeType: dto.scopeType,
        key: normalizedKey,
        rolePermissions: {
          create: permissionIds.map(id => ({
            permissionId: id
          }))
        }
      }
    });
  }

  async delete(organizationId: string, roleId: string) {
    const role = await this.prisma.role.findFirst({ where: { id: roleId, organizationId } });
    
    if (!role) {
      throw new BusinessException('ROLE_NOT_FOUND', 404, 'Role not found');
    }
    
    if (role.type === 'SYSTEM') {
      throw new BusinessException('ROLE_SYSTEM_PROTECTED', 403, 'Cannot delete system role');
    }

    await this.prisma.role.delete({ where: { id: roleId } });
    return { success: true };
  }
}
\);
