import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { ProcessModule } from '../../process/process.module';
import { CommonModule } from '../../common/common.module';
import { OrderRepository } from '../infrastructure/order.repository';
import { GdriveService } from '../../common/gdrive.service';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, ProcessModule],
      providers: [
        OrderService,
        { provide: 'IOrderRepository', useClass: OrderRepository },
        GdriveService,
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
