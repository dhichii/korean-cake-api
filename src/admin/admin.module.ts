import { Module } from '@nestjs/common';
import { AdminController } from './interface/http/admin.controller';

@Module({
  controllers: [AdminController],
})
export class AdminModule {}
