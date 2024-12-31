import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { UserModule } from '../../user/user.module';
import { CommonModule } from '../../common/common.module';

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, UserModule],
      providers: [AdminService],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
