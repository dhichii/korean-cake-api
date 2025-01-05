import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ProgressModule } from './progress/progress.module';

@Module({
  imports: [CommonModule, UserModule, AuthModule, AdminModule, ProgressModule],
  controllers: [AppController],
})
export class AppModule {}
