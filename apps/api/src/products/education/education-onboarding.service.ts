import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class EducationOnboardingService {
  constructor(private prisma: PrismaService) {}

  async provisionEducationProfile(organizationId: string, institutionType: 'SCHOOL' | 'TUITION_CENTER') {
    // Scaffold system roles for education
    return this.prisma.educationOrganizationProfile.create({
      data: {
        organizationId,
        institutionType,
      }
    });
  }
}
