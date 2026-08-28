import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    
    const existing = await this.prisma.userAccount.findUnique({
      where: { email: normalizedEmail }
    });
    
    if (existing) {
      throw new BusinessException('AUTH_EMAIL_TAKEN', 409, 'Email is already taken');
    }

    const passwordHash = await argon2.hash(dto.password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    const user = await this.prisma.\(async (tx) => {
      const newUser = await tx.userAccount.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          status: 'ACTIVE',
        }
      });

      await tx.emailVerificationToken.create({
        data: {
          userAccountId: newUser.id,
          tokenHash: hashedToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }
      });

      return newUser;
    });

    // Send the raw token only
    await this.mailService.sendVerificationEmail(normalizedEmail, verificationToken);

    return { id: user.id, email: user.email };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const hash = crypto.createHash('sha256').update(dto.token).digest('hex');

    await this.prisma.\(async (tx) => {
      const tokenRecord = await tx.emailVerificationToken.findUnique({
        where: { tokenHash: hash },
        include: { userAccount: true }
      });

      if (!tokenRecord) {
        throw new BusinessException('AUTH_INVALID_TOKEN', 400, 'Invalid verification token');
      }

      if (tokenRecord.usedAt) {
        throw new BusinessException('AUTH_TOKEN_USED', 400, 'Token has already been used');
      }

      if (tokenRecord.expiresAt < new Date()) {
        throw new BusinessException('AUTH_TOKEN_EXPIRED', 400, 'Verification token has expired');
      }

      await tx.emailVerificationToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() }
      });

      await tx.userAccount.update({
        where: { id: tokenRecord.userAccountId },
        data: { emailVerifiedAt: new Date() }
      });
    });

    return { success: true };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const user = await this.prisma.userAccount.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      throw new BusinessException('AUTH_INVALID_CREDENTIALS', 401, 'Invalid credentials');
    }

    const validPassword = await argon2.verify(user.passwordHash, dto.password);
    if (!validPassword) {
      throw new BusinessException('AUTH_INVALID_CREDENTIALS', 401, 'Invalid credentials');
    }

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw new BusinessException('AUTH_ACCOUNT_SUSPENDED', 403, 'Account is not active');
    }

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const familyId = crypto.randomUUID();

    await this.prisma.\([
      this.prisma.userAccount.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      }),
      this.prisma.authSession.create({
        data: {
          userAccountId: user.id,
          familyId,
          refreshTokenHash: hashedRefreshToken,
          expiresAt,
          ipAddress,
          userAgent,
          lastUsedAt: new Date(),
        }
      })
    ]);

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, emailVerifiedAt: user.emailVerifiedAt } };
  }

  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    const session = await this.prisma.authSession.findUnique({
      where: { refreshTokenHash: hashedRefreshToken },
      include: { userAccount: true }
    });

    if (!session || session.expiresAt < new Date()) {
      throw new BusinessException('AUTH_INVALID_TOKEN', 401, 'Invalid or expired refresh token');
    }

    if (session.revokedAt) {
      // Replay of a revoked or rotated token! Revoke entire family.
      await this.prisma.authSession.updateMany({
        where: { familyId: session.familyId, revokedAt: null },
        data: { 
          revokedAt: new Date(), 
          revokeReason: 'REPLAY_DETECTED' 
        }
      });
      throw new BusinessException('AUTH_INVALID_TOKEN', 401, 'Session revoked');
    }

    const user = session.userAccount;
    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw new BusinessException('AUTH_ACCOUNT_SUSPENDED', 403, 'Account is not active');
    }

    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newHashedRefreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newSession = await this.prisma.\(async (tx) => {
      // Create new session in the same family
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

      // Mark the old session as replaced (revoked)
      await tx.authSession.update({
        where: { id: session.id },
        data: {
          revokedAt: new Date(),
          revokeReason: 'ROTATED',
          replacedBySessionId: created.id
        }
      });

      return created;
    });

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });

    return { accessToken, newRefreshToken };
  }

  async logout(refreshToken: string) {
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.authSession.updateMany({
      where: { refreshTokenHash: hashedRefreshToken, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: 'LOGOUT' }
    });
  }

  async logoutAll(userAccountId: string) {
    await this.prisma.authSession.updateMany({
      where: { userAccountId, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: 'LOGOUT_ALL' }
    });
  }

  async forgotPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.userAccount.findUnique({
      where: { email: normalizedEmail }
    });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      
      await this.prisma.\(async (tx) => {
        // Invalidate unused reset tokens
        await tx.passwordResetToken.updateMany({
          where: { userAccountId: user.id, usedAt: null },
          data: { usedAt: new Date() } // or create a revokedAt field, but usedAt acts effectively the same for invalidating
        });

        await tx.passwordResetToken.create({
          data: {
            userAccountId: user.id,
            tokenHash: hash,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
          }
        });
      });
      await this.mailService.sendPasswordResetEmail(normalizedEmail, token);
    }
  }

  async resetPassword(dto: any) {
    const hash = crypto.createHash('sha256').update(dto.token).digest('hex');
    
    return this.prisma.\(async (tx) => {
      const resetToken = await tx.passwordResetToken.findUnique({
        where: { tokenHash: hash }
      });

      if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
        throw new BusinessException('AUTH_INVALID_TOKEN', 400, 'Invalid or expired token');
      }

      const passwordHash = await argon2.hash(dto.newPassword);
      
      await tx.userAccount.update({
        where: { id: resetToken.userAccountId },
        data: { passwordHash }
      });

      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() }
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
