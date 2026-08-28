import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { DatabaseModule } from "../../infrastructure/database/database.module";

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("ACCESS_TOKEN_SECRET"),
        signOptions: {
          expiresIn: config.getOrThrow<string>("ACCESS_TOKEN_EXPIRY") as any,
          issuer: config.getOrThrow<string>("JWT_ISSUER"),
          audience: config.getOrThrow<string>("JWT_AUDIENCE"),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
