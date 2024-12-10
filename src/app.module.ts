import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { PrismaService } from './common/prisma.service';
import { ValidationService } from './common/validation.service';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';

@Module({
  imports: [CommonModule, UserModule],
  controllers: [AppController],
  providers: [PrismaService, ValidationService],
  exports: [PrismaService, ValidationService],
})
export class AppModule {}
