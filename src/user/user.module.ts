import { Module } from '@nestjs/common';
import { UserRepository } from './infrastructure/user.repository';
import { UserService } from './application/user.service';
import { UserController } from './interface/http/user.controller';

@Module({
  controllers: [UserController],
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
