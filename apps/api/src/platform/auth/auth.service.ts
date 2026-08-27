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

  async login(dto: LoginDto) {
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

    // Create auth session... (simulated)

    return { accessToken, refreshToken, user: { id: user.id, email: user.email } };
  }
}
