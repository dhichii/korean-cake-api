import { Role } from '@prisma/client';
import {
  AddUserDto,
  ChangeEmailDto,
  ChangeUsernameDto,
  ChangeUserPasswordDto,
  EditUserProfileDto,
} from '../interface/http/user.request';
import {
  UserResponseDto,
  UserFullResponseDto,
} from '../interface/http/user.response';

export interface IUserService {
  add(req: AddUserDto): Promise<{ id: string }>;
  getAll(role?: Role): Promise<UserResponseDto[]>;
  getById(id: string): Promise<UserResponseDto>;
  getByUsername(username: string): Promise<UserFullResponseDto>;
  editProfileById(id: string, data: EditUserProfileDto): Promise<void>;
  deleteById(id: string): Promise<void>;
  changeEmail(id: string, req: ChangeEmailDto): Promise<void>;
  changeUsername(id: string, req: ChangeUsernameDto): Promise<void>;
  changePassword(id: string, req: ChangeUserPasswordDto): Promise<void>;
}
