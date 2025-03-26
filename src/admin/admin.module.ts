import { Module } from '@nestjs/common';
import { AdminController } from './interface/http/admin.controller';
import { AdminService } from './application/admin.service';

@Module({
  controllers: [AdminController],
  providers: [{ provide: 'IAdminService', useClass: AdminService }],
})
export class AdminModule {}
