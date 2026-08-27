import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { BusinessException } from '../../common/exceptions/business.exception';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService, private mailService: MailService) {}

  async create(organizationId: string, dto: any) {
    const email = dto.email.trim().toLowerCase();
    
    // Validate not member
    const member = await this.prisma.organizationMembership.findFirst({
      where: { organizationId, userAccount: { email } }
    });
    if (member) throw new BusinessException('INVITATION_EMAIL_ALREADY_MEMBER', 400, 'Already a member');

    // Token generation
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    const invitation = await this.prisma.organizationInvitation.create({
      data: {
        organizationId,
        email,
        tokenHash: hash,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    await this.mailService.sendInvitationEmail(email, token, 'Organization');
    return { id: invitation.id, email: invitation.email };
  }

  async accept(token: string) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const invitation = await this.prisma.organizationInvitation.findFirst({
      where: { tokenHash: hash, status: 'PENDING' }
    });

    if (!invitation) throw new BusinessException('INVITATION_NOT_FOUND', 404, 'Invalid invitation');
    if (invitation.expiresAt < new Date()) throw new BusinessException('INVITATION_EXPIRED', 400, 'Expired');

    await this.prisma.$transaction(async (tx) => {
      // Find or create user...
      // Create membership...
      // Mark ACCEPTED...
      await tx.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' }
      });
    });

    return { success: true };
  }
}
