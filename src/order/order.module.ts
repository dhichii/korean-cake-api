import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { OrderController } from './interface/http/order.controller';
import { OrderService } from './application/order.service';
import * as path from 'path';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { OrderRepository } from './infrastructure/order.repository';
import { ProcessModule } from '../process/process.module';

@Module({
  imports: [
    ProcessModule,
    MulterModule.register({
      storage: diskStorage({
        destination: process.env.MULTER_UPLOAD_DIRECTORY,
        filename: (_req, file, cb) => {
          // get the file extension
          const ext = path.extname(file.originalname);
          const fileName = uuid() + ext;

          cb(null, fileName);
        },
      }),
    }),
  ],
  controllers: [OrderController],
  providers: [
    { provide: 'IOrderRepository', useClass: OrderRepository },
    { provide: 'IOrderService', useClass: OrderService },
  ],
})
export class OrderModule {}
