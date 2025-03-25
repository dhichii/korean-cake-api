import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTSignPayload } from '../interface/http/auth.response';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_KEY,
    });
  }

  async validate(payload: JWTSignPayload) {
    return {
      id: payload.id,
      name: payload.name,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      tokenVersion: payload.tokenVersion,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    };
  }
}
