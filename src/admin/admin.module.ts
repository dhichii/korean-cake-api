import { Module } from '@nestjs/common';
import { AdminController } from './interface/http/admin.controller';
import { AdminService } from './application/admin.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AdminController],
  providers: [{ provide: 'IAdminService', useClass: AdminService }],
})
export class AdminModule {}
