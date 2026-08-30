import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from "@nestjs/common";
import { Request, Response } from "express";

import { Public } from "../../common/decorators/public.decorator";
import { BusinessException } from "../../common/exceptions/business.exception";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

import { AuthService } from "./auth.service";
import {
  ForgotPasswordDto,
  forgotPasswordSchema,
} from "./dto/forgot-password.dto";
import { LoginDto, loginSchema } from "./dto/login.dto";
import { RegisterDto, registerSchema } from "./dto/register.dto";
import {
  ResetPasswordDto,
  resetPasswordSchema,
} from "./dto/reset-password.dto";
import { VerifyEmailDto, verifyEmailSchema } from "./dto/verify-email.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto,
  ) {
    const result = await this.authService.register(dto);
    return { success: true, data: result };
  }

  @Public()
  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body(new ZodValidationPipe(verifyEmailSchema)) dto: VerifyEmailDto,
  ) {
    const result = await this.authService.verifyEmail(dto);
    return result;
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const { accessToken, refreshToken, user } = await this.authService.login(
      dto,
      ipAddress,
      userAgent,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { success: true, data: { accessToken, user } };
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new BusinessException(
        "AUTH_MISSING_TOKEN",
        401,
        "No refresh token provided",
      );
    }

    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const { accessToken, newRefreshToken } = await this.authService.refresh(
      refreshToken,
      ipAddress,
      userAgent,
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { success: true, data: { accessToken } };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    return { success: true };
  }

  @Post("logout-all")
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @Req() req: Request & { user: { userAccountId: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(req.user.userAccountId);
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    return { success: true };
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema)) dto: ForgotPasswordDto,
  ) {
    await this.authService.forgotPassword(dto.email);
    return {
      success: true,
      message: "If an account exists, a reset link has been sent.",
    };
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) dto: ResetPasswordDto,
  ) {
    await this.authService.resetPassword(dto);
    return { success: true };
  }
}
