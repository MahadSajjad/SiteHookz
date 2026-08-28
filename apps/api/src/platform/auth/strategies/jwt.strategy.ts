import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("ACCESS_TOKEN_SECRET"),
      issuer: configService.getOrThrow<string>("JWT_ISSUER"),
      audience: configService.getOrThrow<string>("JWT_AUDIENCE"),
    });
  }

  async validate(payload: JwtPayload) {
    return { userAccountId: payload.sub, email: payload.email };
  }
}
