import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CommonModule } from '../../common/common.module';
import { UserRepository } from '../infrastructure/user.repository';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CommonModule],
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
