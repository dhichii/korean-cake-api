import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { JWTSignPayload } from '../interface/http/auth.response';
import { Request } from 'express';

export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        const token = req.cookies['refresh'];
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_KEY,
    });
  }

  async validate(payload: JWTSignPayload) {
    return {
      id: payload.id,
      name: payload.name,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    };
  }
}
