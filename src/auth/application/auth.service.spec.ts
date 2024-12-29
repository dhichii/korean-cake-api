import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CommonModule } from '../../common/common.module';
import { AuthRepository } from '../infrastructure/auth.repository';
import { UserModule } from '../../user/user.module';
import { JwtModule } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CommonModule,
        UserModule,
        JwtModule.register({
          secret: process.env.ACCESS_TOKEN_KEY,
          signOptions: { expiresIn: process.env.ACCESS_TOKEN_AGE },
        }),
      ],
      providers: [
        {
          provide: 'IAuthRepository',
          useClass: AuthRepository,
        },
        AuthService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
