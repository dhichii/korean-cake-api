import { Role } from '@prisma/client';
import { AddUserDto, EditUserProfileDto } from '../interface/http/user.request';
import {
  UserResponseDto,
  UserWithPasswordResponseDto,
} from '../interface/http/user.response';

export interface IUserService {
  add(req: AddUserDto): Promise<{ id: string }>;
  getAll(role?: Role): Promise<UserResponseDto[]>;
  getById(id: string): Promise<UserResponseDto>;
  getByUsername(username: string): Promise<UserWithPasswordResponseDto>;
  editProfileById(id: string, data: EditUserProfileDto): Promise<void>;
  deleteById(id: string): Promise<void>;
  changeEmail(id: string, email: string): Promise<void>;
  changeUsername(id: string, username: string): Promise<void>;
  changePassword(id: string, password: string): Promise<void>;
}
