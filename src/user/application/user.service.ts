import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../domain/user.repository.interface';
import {
  AddUserDto,
  EditUserProfileDto,
  mapAddUserDto,
} from '../interface/http/user.request';
import {
  UserResponseDto,
  UserWithPasswordResponseDto,
} from '../interface/http/user.response';
import { IUserService } from '../domain/user.service.interface';
import { Bcrypt } from '../../utils/Bcrypt';
import { ValidationService } from '../../common/validation.service';
import { UserValidation } from './user.validation';
import { Role } from '@prisma/client';
import { IAuthService } from '../../auth/domain/auth.service.interface';
import { PrismaService } from '../../common/prisma.service';
import { TokenResponse } from '../../auth/interface/http/auth.response';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject('IUserRepository') private userRepository: IUserRepository,
    @Inject(forwardRef(() => 'IAuthService')) private authService: IAuthService,
    private validationService: ValidationService,
    private prismaService: PrismaService,
  ) {}

  async add(req: AddUserDto): Promise<{ id: string }> {
    this.validationService.validate(UserValidation.ADD, req);

    const data = await mapAddUserDto(req);
    const id = await this.userRepository.add(data);

    return { id };
  }

  async getAll(role?: Role): Promise<UserResponseDto[]> {
    const res = await this.userRepository.getAll(role);
    const data = res.map((v) => {
      return {
        id: v.id,
        name: v.name,
        username: v.username,
        email: v.email,
        role: v.role,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      };
    });

    return data;
  }

  async getById(id: string): Promise<UserResponseDto> {
    this.validationService.validate(UserValidation.GET_BY_ID, id);

    const data = await this.userRepository.getById(id);

    return {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      role: data.role,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async getByUsername(username: string): Promise<UserWithPasswordResponseDto> {
    this.validationService.validate(UserValidation.GET_BY_USERNAME, username);

    const data = await this.userRepository.getByUsername(username);

    return {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      role: data.role,
      password: data.password,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async editProfileById(id: string, req: EditUserProfileDto): Promise<void> {
    this.validationService.validate(UserValidation.EDIT_PROFILE_BY_ID, {
      id,
      ...req,
    });

    await this.userRepository.verify(id);
    await this.userRepository.editProfileById(id, req);
  }

  async deleteById(id: string): Promise<void> {
    this.validationService.validate(UserValidation.DELETE_BY_ID, id);

    await this.userRepository.verify(id);
    await this.userRepository.deleteById(id);
  }

  async changeEmail(
    id: string,
    refreshToken: string,
    email: string,
  ): Promise<TokenResponse> {
    this.validationService.validate(UserValidation.CHANGE_EMAIL, { id, email });

    const user = await this.getById(id);

    let data: TokenResponse;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.prismaService.$transaction(async (tx) => {
      await this.userRepository.changeEmail(id, email);
      await this.authService.logout(refreshToken);
      data = await this.authService.login({ ...user, email });
    });

    return data;
  }

  async changeUsername(
    id: string,
    refreshToken: string,
    username: string,
  ): Promise<TokenResponse> {
    this.validationService.validate(UserValidation.CHANGE_USERNAME, {
      id,
      username,
    });

    const user = await this.getById(id);

    let data: TokenResponse;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.prismaService.$transaction(async (tx) => {
      await this.userRepository.changeUsername(id, username);
      await this.authService.logout(refreshToken);
      data = await this.authService.login({ ...user, username });
    });

    return data;
  }

  async changePassword(id: string, password: string): Promise<void> {
    this.validationService.validate(UserValidation.CHANGE_PASSWORD, {
      id,
      password,
    });

    await this.userRepository.verify(id);

    const hashedPassword = await new Bcrypt().hash(password);
    await this.userRepository.changePassword(id, hashedPassword);
  }
}
