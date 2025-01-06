import { Test, TestingModule } from '@nestjs/testing';
import { ProcessService } from './process.service';
import { CommonModule } from '../../common/common.module';
import { ProcessRepository } from '../infrastructure/process.repository';

describe('ProcessService', () => {
  let service: ProcessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CommonModule],
      providers: [
        {
          provide: 'IProcessRepository',
          useClass: ProcessRepository,
        },
        ProcessService,
      ],
    }).compile();

    service = module.get<ProcessService>(ProcessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
