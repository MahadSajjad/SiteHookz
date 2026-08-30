import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

import { BusinessException } from "../../common/exceptions/business.exception";
import { PrismaService } from "../../infrastructure/database/prisma.service";

@Injectable()
export class TenantResolverService {
  private readonly logger = new Logger(TenantResolverService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async resolveTenant(
    req: Request,
  ): Promise<import("@sitehookz/database").Organization> {
    const isProd = process.env.NODE_ENV === "production";

    // Strict usage of x-sitehookz-organization
    let slug = req.headers["x-sitehookz-organization"] as string;

    // Fallback only allowed in non-production
    if (!isProd && !slug) {
      slug = req.headers["x-organization-slug"] as string;
    }

    if (slug) {
      slug = slug.trim().toLowerCase();
    }

    if (!slug) {
      throw new BusinessException(
        "ORGANIZATION_NOT_FOUND",
        404,
        "Organization slug not provided or could not be resolved",
      );
    }

    const org = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (!org) {
      throw new BusinessException(
        "ORGANIZATION_NOT_FOUND",
        404,
        "Organization not found",
      );
    }

    if (
      org.status === "SUSPENDED" ||
      org.status === "CANCELLED" ||
      org.status === "ARCHIVED"
    ) {
      throw new BusinessException(
        "ORGANIZATION_SUSPENDED",
        403,
        "Organization is not active",
      );
    }

    return org;
  }
}
