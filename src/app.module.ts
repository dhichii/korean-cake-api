import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ProcessModule } from './process/process.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    AuthModule,
    AdminModule,
    ProcessModule,
    OrderModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
