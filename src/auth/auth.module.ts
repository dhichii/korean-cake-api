import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './interface/http/auth.controller';
import { AuthService } from './application/auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthRepository } from './infrastructure/auth.repository';

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_KEY,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_AGE },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'IAuthRepository',
      useClass: AuthRepository,
    },
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
  ],
  exports: ['IAuthService'],
})
export class AuthModule {}
