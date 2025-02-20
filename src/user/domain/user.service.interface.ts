import { Role } from '@prisma/client';
import {
  AddUserDto,
  ChangeUserPasswordDto,
  EditUserProfileDto,
} from '../interface/http/user.request';
import {
  UserResponseDto,
  UserWithPasswordResponseDto,
} from '../interface/http/user.response';
import { TokenResponse } from '../../auth/interface/http/auth.response';

export interface IUserService {
  add(req: AddUserDto): Promise<{ id: string }>;
  getAll(role?: Role): Promise<UserResponseDto[]>;
  getById(id: string): Promise<UserResponseDto>;
  getByUsername(username: string): Promise<UserWithPasswordResponseDto>;
  editProfileById(id: string, data: EditUserProfileDto): Promise<void>;
  deleteById(id: string): Promise<void>;
  changeEmail(
    id: string,
    refreshToken: string,
    email: string,
  ): Promise<TokenResponse>;
  changeUsername(
    id: string,
    refreshToken: string,
    username: string,
  ): Promise<TokenResponse>;
  changePassword(id: string, req: ChangeUserPasswordDto): Promise<void>;
}
