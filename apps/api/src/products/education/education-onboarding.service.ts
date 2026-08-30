import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../infrastructure/database/prisma.service";

@Injectable()
export class EducationOnboardingService {
  constructor(private prisma: PrismaService) {}

  async provisionEducationProfile(userAccountId: string, dto: any) {
    return this.prisma.$transaction(async (tx) => {
      // Create Organization
      const org = await tx.organization.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          status: "ACTIVE", // Jump to active for this product
          defaultLocale: dto.defaultLocale,
          timezone: dto.timezone,
          currency: dto.currency,
        },
      });

      // Create Education Profile
      await tx.educationOrganizationProfile.create({
        data: {
          organizationId: org.id,
          institutionType: dto.institutionType,
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

      // Assign an Owner role
      const role = await tx.role.create({
        data: {
          organizationId: org.id,
          name: "Owner",
          type: "SYSTEM",
          scopeType: "ORGANIZATION",
          key: "education_owner",
        },
      });

      await tx.roleAssignment.create({
        data: {
          membershipId: membership.id,
          roleId: role.id,
        },
      });

      return org;
    });
  }
}
