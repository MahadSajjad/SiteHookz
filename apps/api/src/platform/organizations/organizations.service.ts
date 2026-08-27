import { Injectable } from '@nestjs/common';
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
    if (RESERVED_SLUGS.has(dto.slug)) {
      throw new BusinessException('ORGANIZATION_SLUG_RESERVED', 400, 'Slug is reserved');
    }

    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug: dto.slug }
    });

    if (existingOrg) {
      throw new BusinessException('ORGANIZATION_SLUG_TAKEN', 409, 'Slug is already in use');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create Organization
      const org = await tx.organization.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          status: 'ONBOARDING',
          settings: {
            defaultLocale: dto.defaultLocale,
            timezone: dto.timezone,
            currency: dto.currency,
          }
        }
      });

      // Create Education Profile
      await tx.educationOrganizationProfile.create({
        data: {
          organizationId: org.id,
          institutionType: dto.institutionType,
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

      // Assign an Owner role (System role logic abbreviated for skeleton)
      const role = await tx.role.create({
        data: {
          organizationId: org.id,
          name: 'Owner',
          type: 'SYSTEM',
          scopeType: 'ORGANIZATION',
          key: 'system_owner'
        }
      });

      await tx.roleAssignment.create({
        data: {
          organizationMembershipId: membership.id,
          roleId: role.id,
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
