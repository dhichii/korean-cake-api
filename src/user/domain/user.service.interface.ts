import { Role } from '@prisma/client';
import { AddUserReq } from '../interface/http/user.request';
import {
  UserResponse,
  UserWithPasswordResponse,
} from '../interface/http/user.response';

export interface IUserService {
  add(req: AddUserReq): Promise<{ id: string }>;
  getAll(role?: Role): Promise<UserResponse[]>;
  getById(id: string): Promise<UserResponse>;
  getByUsername(username: string): Promise<UserWithPasswordResponse>;
  deleteById(id: string): Promise<void>;
  changeEmail(id: string, email: string): Promise<void>;
  changeUsername(id: string, username: string): Promise<void>;
  changePassword(id: string, password: string): Promise<void>;
}
