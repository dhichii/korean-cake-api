import { Module } from '@nestjs/common';
import { UserRepository } from './infrastructure/user.repository';
import { UserService } from './application/user.service';

@Module({
  providers: [UserRepository, UserService],
})
export class UserModule {}
