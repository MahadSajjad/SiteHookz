import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { BusinessException } from "../../common/exceptions/business.exception";

const RESERVED_SLUGS = new Set([
  "www",
  "api",
  "admin",
  "app",
  "auth",
  "mail",
  "smtp",
  "cdn",
  "status",
  "help",
  "support",
  "billing",
  "docs",
  "static",
  "assets",
  "system",
  "root",
  "superadmin",
  "platform",
]);

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(userAccountId: string, dto: CreateOrganizationDto) {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userAccountId },
    });

    if (!user || !user.emailVerifiedAt) {
      throw new BusinessException(
        "ORGANIZATION_CREATION_DENIED",
        403,
        "Email must be verified to create an organization",
      );
    }

    if (RESERVED_SLUGS.has(dto.slug)) {
      throw new BusinessException(
        "ORGANIZATION_SLUG_RESERVED",
        400,
        "Slug is reserved",
      );
    }

    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });

    if (existingOrg) {
      throw new BusinessException(
        "ORGANIZATION_SLUG_TAKEN",
        409,
        "Slug is already in use",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Create Organization
      const org = await tx.organization.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          status: "ONBOARDING",
          defaultLocale: dto.defaultLocale,
          timezone: dto.timezone,
          currency: dto.currency,
        },
      });

      // Create Membership for Creator
      const membership = await tx.organizationMembership.create({
        data: {
          organizationId: org.id,
          userAccountId: userAccountId,
          status: "ACTIVE",
        },
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
            status: "ACTIVE",
          },
        },
      },
    });
  }
}
