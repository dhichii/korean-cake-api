import { Module } from '@nestjs/common';
import { UserRepository } from './infrastructure/user.repository';
import { UserService } from './application/user.service';

@Module({
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IUserService',
      useClass: UserService,
    },
  ],
  exports: ['IUserService'],
})
export class UserModule {}
