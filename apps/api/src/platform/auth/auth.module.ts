import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';

// NOTE: These would be imported from the same directory in a full app
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('ACCESS_TOKEN_SECRET', 'fallback-secret'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [
    // AuthController
  ],
  providers: [
    // AuthService,
    // JwtStrategy
  ],
  exports: [
    // AuthService
  ],
})
export class AuthModule {}
