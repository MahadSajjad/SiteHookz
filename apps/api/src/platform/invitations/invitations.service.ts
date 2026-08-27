import { Injectable } from '@nestjs/common';
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

    // Token generation
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    const invitation = await this.prisma.organizationInvitation.create({
      data: {
        organizationId,
        email,
        tokenHash: hash,
        status: 'PENDING',
        invitedByMembershipId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    await this.mailService.sendInvitationEmail(email, token, 'Organization');
    return { id: invitation.id, email: invitation.email };
  }

  async accept(token: string, userAccountId: string) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    
    return this.prisma.$transaction(async (tx) => {
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
      if (user.email !== invitation.email) {
        throw new BusinessException('INVITATION_EMAIL_MISMATCH', 400, 'Email mismatch');
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
            branchId: assignment.branchId
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
