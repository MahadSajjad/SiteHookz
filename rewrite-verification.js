const fs = require('fs');
let content = fs.readFileSync('apps/api/src/platform/auth/auth.service.ts', 'utf8');

const verifyRegex = /async verifyEmail\([\s\S]*?async login\(/;
const newVerify = `async verifyEmail(dto: VerifyEmailDto) {
    const hash = crypto.createHash('sha256').update(dto.token).digest('hex');

    await this.prisma.$transaction(async (tx) => {
      // Find user account ID first to update the user
      const tokenRecord = await tx.emailVerificationToken.findUnique({
        where: { tokenHash: hash }
      });

      if (!tokenRecord) {
        throw new BusinessException('AUTH_INVALID_TOKEN', 400, 'Invalid verification token');
      }

      // Atomic claim
      const claimResult = await tx.emailVerificationToken.updateMany({
        where: { 
          id: tokenRecord.id, 
          usedAt: null, 
          expiresAt: { gt: new Date() } 
        },
        data: { usedAt: new Date() }
      });

      if (claimResult.count !== 1) {
        throw new BusinessException('AUTH_TOKEN_USED_OR_EXPIRED', 400, 'Token has already been used or has expired');
      }

      await tx.userAccount.update({
        where: { id: tokenRecord.userAccountId },
        data: { emailVerifiedAt: new Date() }
      });
    });

    return { success: true };
  }

  async login(`;

content = content.replace(verifyRegex, newVerify);

// Reset password
const resetRegex = /async resetPassword\([\s\S]*?}\s*}\s*$/;
const newReset = `async resetPassword(dto: import('./dto/reset-password.dto').ResetPasswordDto) {
    const hash = crypto.createHash('sha256').update(dto.token).digest('hex');
    
    return this.prisma.$transaction(async (tx) => {
      const resetToken = await tx.passwordResetToken.findUnique({
        where: { tokenHash: hash }
      });

      if (!resetToken) {
        throw new BusinessException('AUTH_INVALID_TOKEN', 400, 'Invalid token');
      }

      // Atomic claim
      const claimResult = await tx.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          usedAt: null,
          expiresAt: { gt: new Date() }
        },
        data: { usedAt: new Date() }
      });

      if (claimResult.count !== 1) {
        throw new BusinessException('AUTH_INVALID_TOKEN', 400, 'Invalid, used, or expired token');
      }

      const passwordHash = await argon2.hash(dto.newPassword);
      
      await tx.userAccount.update({
        where: { id: resetToken.userAccountId },
        data: { passwordHash }
      });

      // Revoke all active AuthSessions
      await tx.authSession.updateMany({
        where: { userAccountId: resetToken.userAccountId, revokedAt: null },
        data: { revokedAt: new Date(), revokeReason: 'PASSWORD_RESET' }
      });

      return { success: true };
    });
  }
}
`;

content = content.replace(resetRegex, newReset);
fs.writeFileSync('apps/api/src/platform/auth/auth.service.ts', content, 'utf8');
