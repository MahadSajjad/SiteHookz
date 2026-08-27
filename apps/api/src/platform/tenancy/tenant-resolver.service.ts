import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Request } from 'express';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class TenantResolverService {
  private readonly logger = new Logger(TenantResolverService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async resolveTenant(req: Request): Promise<any> {
    const mode = this.configService.get('TENANT_RESOLUTION_MODE', 'production');
    let slug: string | null = null;

    if (mode === 'development' && this.configService.get('DEV_TENANT_HEADER_ENABLED') === 'true') {
      slug = req.headers['x-organization-slug'] as string;
    } else {
      const host = req.hostname;
      if (host) {
        const parts = host.split('.');
        if (parts.length > 2) {
          slug = parts[0];
        }
      }
    }

    if (!slug) {
      throw new BusinessException('ORGANIZATION_NOT_FOUND', 404, 'Organization slug not provided or could not be resolved');
    }

    const org = await this.prisma.organization.findUnique({
      where: { slug }
    });

    if (!org) {
      throw new BusinessException('ORGANIZATION_NOT_FOUND', 404, 'Organization not found');
    }

    if (org.status === 'SUSPENDED' || org.status === 'CANCELLED' || org.status === 'ARCHIVED') {
      throw new BusinessException('ORGANIZATION_SUSPENDED', 403, 'Organization is not active');
    }

    return org;
  }
}
