import { Role } from '@prisma/client';
import { UserEntity } from './user.entity';

export interface IUserRepository {
  add(data: UserEntity): Promise<string>;
  getAll(role?: Role): Promise<UserEntity[]>;
  getById(id: string): Promise<UserEntity>;
  getByUsername(username: string): Promise<UserEntity>;
  changeEmail(id: string, email: string): Promise<void>;
  changeUsername(id: string, username: string): Promise<void>;
  changePassword(id: string, password: string): Promise<void>;
  deleteById(id: string): Promise<void>;
  verify(id: string): Promise<void>;
}
