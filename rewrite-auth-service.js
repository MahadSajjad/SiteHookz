const fs = require('fs');

let content = fs.readFileSync('apps/api/src/platform/auth/auth.service.ts', 'utf8');

// Replace refresh method completely
const refreshRegex = /async refresh\([\s\S]*?async logout\(/;

const newRefresh = `async refresh(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    // Read session to get familyId and userAccount, outside transaction
    const session = await this.prisma.authSession.findUnique({
      where: { refreshTokenHash: hashedRefreshToken },
      include: { userAccount: true }
    });

    if (!session || session.expiresAt < new Date()) {
      throw new BusinessException('AUTH_INVALID_TOKEN', 401, 'Invalid or expired refresh token');
    }

    const user = session.userAccount;
    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw new BusinessException('AUTH_ACCOUNT_SUSPENDED', 403, 'Account is not active');
    }

    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newHashedRefreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newSession = await this.prisma.$transaction(async (tx) => {
      // Atomically claim the active session
      const updateResult = await tx.authSession.updateMany({
        where: { 
          id: session.id,
          refreshTokenHash: hashedRefreshToken,
          revokedAt: null
        },
        data: {
          revokedAt: new Date(),
          revokeReason: 'ROTATED'
        }
      });

      // If we couldn't claim it, it means a concurrent request already rotated it or it was revoked
      if (updateResult.count !== 1) {
        // Treat as replay and revoke the whole family
        await tx.authSession.updateMany({
          where: { familyId: session.familyId, revokedAt: null },
          data: { 
            revokedAt: new Date(), 
            revokeReason: 'REPLAY_DETECTED' 
          }
        });
        throw new BusinessException('AUTH_INVALID_TOKEN', 401, 'Session compromised and revoked');
      }

      // Claim successful, create the replacement session
      const created = await tx.authSession.create({
        data: {
          userAccountId: user.id,
          familyId: session.familyId,
          refreshTokenHash: newHashedRefreshToken,
          expiresAt,
          ipAddress,
          userAgent,
          lastUsedAt: new Date(),
        }
      });

      // Link the old session to the new one
      await tx.authSession.update({
        where: { id: session.id },
        data: { replacedBySessionId: created.id }
      });

      return created;
    });

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });

    return { accessToken, newRefreshToken };
  }

  async logout(`;

content = content.replace(refreshRegex, newRefresh);
fs.writeFileSync('apps/api/src/platform/auth/auth.service.ts', content, 'utf8');
