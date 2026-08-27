import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class UserAccountService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.userAccount.findUnique({
      where: { email: email.trim().toLowerCase() }
    });
  }

  async findById(id: string) {
    return this.prisma.userAccount.findUnique({
      where: { id }
    });
  }

  async updateLastLogin(id: string) {
    return this.prisma.userAccount.update({
      where: { id },
      data: { lastLoginAt: new Date() }
    });
  }
}
