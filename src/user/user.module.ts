import { Module } from '@nestjs/common';
import { UserRepository } from './infrastructure/user.repository';

@Module({
  providers: [UserRepository],
})
export class UserModule {}
