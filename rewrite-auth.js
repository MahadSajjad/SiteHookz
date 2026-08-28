const fs = require('fs');

// Auth Controller
let ac = fs.readFileSync('apps/api/src/platform/auth/auth.controller.ts', 'utf8');

const acImports = `import { ForgotPasswordDto, forgotPasswordSchema } from './dto/forgot-password.dto';
import { ResetPasswordDto, resetPasswordSchema } from './dto/reset-password.dto';`;
ac = ac.replace(/import { VerifyEmailDto, verifyEmailSchema } from '.\/dto\/verify-email.dto';/, `import { VerifyEmailDto, verifyEmailSchema } from './dto/verify-email.dto';\n${acImports}`);

const logoutRegex = /@Post\('logout'\)[\s\S]*?}\s*}\s*$/;
const newLogoutMethods = `@Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    return { success: true };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(@Req() req: Request & { user: { userAccountId: string } }, @Res({ passthrough: true }) res: Response) {
    await this.authService.logoutAll(req.user.userAccountId);
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    return { success: true };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body(new ZodValidationPipe(forgotPasswordSchema)) dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { success: true, message: 'If an account exists, a reset link has been sent.' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body(new ZodValidationPipe(resetPasswordSchema)) dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { success: true };
  }
}
`;
ac = ac.replace(logoutRegex, newLogoutMethods);
fs.writeFileSync('apps/api/src/platform/auth/auth.controller.ts', ac, 'utf8');


// Jwt Strategy
let js = fs.readFileSync('apps/api/src/platform/auth/strategies/jwt.strategy.ts', 'utf8');
js = js.replace(/async validate\(payload: any\) {/g, `interface JwtPayload { sub: string; email: string; }
  async validate(payload: JwtPayload) {`);

js = js.replace(/secretOrKey: configService.getOrThrow<string>\('ACCESS_TOKEN_SECRET'\),/g, `secretOrKey: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
      issuer: configService.getOrThrow<string>('JWT_ISSUER'),
      audience: configService.getOrThrow<string>('JWT_AUDIENCE'),`);

fs.writeFileSync('apps/api/src/platform/auth/strategies/jwt.strategy.ts', js, 'utf8');

// Auth Module
let am = fs.readFileSync('apps/api/src/platform/auth/auth.module.ts', 'utf8');
am = am.replace(/signOptions: { expiresIn: '15m' },/g, `signOptions: { 
          expiresIn: config.getOrThrow<string>('ACCESS_TOKEN_TTL'),
          issuer: config.getOrThrow<string>('JWT_ISSUER'),
          audience: config.getOrThrow<string>('JWT_AUDIENCE'),
        },`);
fs.writeFileSync('apps/api/src/platform/auth/auth.module.ts', am, 'utf8');
