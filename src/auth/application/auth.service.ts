import {
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ValidationService } from '../../common/validation.service';
import { IUserService } from '../../user/domain/user.service.interface';
import { RefreshReq, RegisterReq } from '../interface/http/auth.request';
import { TokenResponse, JWTSignPayload } from '../interface/http/auth.response';
import { IAuthService } from '../domain/auth.service.interface';
import { Bcrypt } from '../../utils/Bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IAuthRepository } from '../domain/auth.repository.interface';
import { PrismaService } from '../../common/prisma.service';
import { convertMilisToDate } from '../../utils/date';
import { AuthValidation } from './auth.validation';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('IAuthRepository') private authRepository: IAuthRepository,
    @Inject('IUserService') private userService: IUserService,
    private validationService: ValidationService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<JWTSignPayload> {
    try {
      const { password: hashedPassword, ...user } =
        await this.userService.getByUsername(username);

      await new Bcrypt().compare(password, hashedPassword);

      return user;
    } catch (e: unknown) {
      if (e instanceof HttpException) {
        if (e.message === 'user not found') {
          throw new UnauthorizedException('username or password incorrect');
        }
      }

      throw e;
    }
  }

  async register(req: RegisterReq): Promise<void> {
    this.validationService.validate(AuthValidation.REGISTER, req);

    const data = {
      name: req.name,
      username: req.username,
      email: req.email,
      password: req.password,
    };
    await this.userService.add(data);
  }

  async login(payload: JWTSignPayload): Promise<TokenResponse> {
    const access = this.jwtService.sign(payload);
    const refresh = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: process.env.REFRESH_TOKEN_AGE,
    });

    const { exp } = this.jwtService.decode(refresh);
    const expiresAt = convertMilisToDate(exp);

    await this.authRepository.add(refresh, expiresAt);

    return {
      access,
      refresh,
      exp,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.authRepository.revoke(refreshToken);
  }

  async refresh(req: RefreshReq): Promise<TokenResponse> {
    const access = this.jwtService.sign(req.payload);
    const refresh = this.jwtService.sign(req.payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: process.env.REFRESH_TOKEN_AGE,
    });

    const { exp } = this.jwtService.decode(refresh);
    const expiresAt = convertMilisToDate(exp);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.prismaService.$transaction(async (tx) => {
      await this.authRepository.revoke(req.refresh);
      await this.authRepository.add(refresh, expiresAt);
    });

    return {
      access,
      refresh,
      exp,
    };
  }
}
