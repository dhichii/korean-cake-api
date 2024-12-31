import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CommonModule } from '../../common/common.module';
import { UserRepository } from '../infrastructure/user.repository';
import { AuthModule } from '../../auth/auth.module';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, AuthModule],
      providers: [
        {
          provide: 'IUserRepository',
          useClass: UserRepository,
        },
        UserService,
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
