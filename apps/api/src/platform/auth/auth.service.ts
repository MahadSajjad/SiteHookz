import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
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

    const user = await this.prisma.userAccount.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        status: 'ACTIVE', // Or pending verification depending on enum
      }
    });

    // In a real app we'd store the token in EmailVerificationToken table
    // For now we simulate
    await this.mailService.sendVerificationEmail(normalizedEmail, verificationToken);

    return { id: user.id, email: user.email };
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

    await this.prisma.authSession.create({
      data: {
        userAccountId: user.id,
        refreshTokenHash: hashedRefreshToken,
        expiresAt,
        ipAddress,
        userAgent,
        lastUsedAt: new Date(),
      }
    });

    return { accessToken, refreshToken, user: { id: user.id, email: user.email } };
  }

  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    const session = await this.prisma.authSession.findFirst({
      where: { refreshTokenHash: hashedRefreshToken },
      include: { userAccount: true }
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      if (session && !session.revokedAt) {
        // Token exists but is expired. Just delete it.
        await this.prisma.authSession.delete({ where: { id: session.id } });
      }
      if (session && session.revokedAt) {
        // Security incident: Replay of revoked token! Revoke ALL sessions for this user.
        await this.prisma.authSession.updateMany({
          where: { userAccountId: session.userAccountId, revokedAt: null },
          data: { revokedAt: new Date() }
        });
      }
      throw new BusinessException('AUTH_INVALID_TOKEN', 401, 'Invalid refresh token');
    }

    const user = session.userAccount;
    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw new BusinessException('AUTH_ACCOUNT_SUSPENDED', 403, 'Account is not active');
    }

    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newHashedRefreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Rotate the session
    await this.prisma.$transaction([
      this.prisma.authSession.delete({ where: { id: session.id } }),
      this.prisma.authSession.create({
        data: {
          userAccountId: user.id,
          refreshTokenHash: newHashedRefreshToken,
          expiresAt,
          ipAddress,
          userAgent,
          lastUsedAt: new Date(),
        }
      })
    ]);

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });

    return { accessToken, newRefreshToken };
  }

  async logout(refreshToken: string) {
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.authSession.deleteMany({
      where: { refreshTokenHash: hashedRefreshToken }
    });
  }

  async logoutAll(userAccountId: string) {
    await this.prisma.authSession.deleteMany({
      where: { userAccountId }
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
      
      await this.prisma.passwordResetToken.create({
        data: {
          userAccountId: user.id,
          tokenHash: hash,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        }
      });
      await this.mailService.sendPasswordResetEmail(normalizedEmail, token);
    }
  }

  async resetPassword(dto: any) {
    const hash = crypto.createHash('sha256').update(dto.token).digest('hex');
    
    return this.prisma.$transaction(async (tx) => {
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

      // Revoke existing AuthSessions
      await tx.authSession.updateMany({
        where: { userAccountId: resetToken.userAccountId, revokedAt: null },
        data: { revokedAt: new Date() }
      });

      return { success: true };
    });
  }
}
