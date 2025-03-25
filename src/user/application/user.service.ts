import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { IUserRepository } from '../domain/user.repository.interface';
import {
  AddUserDto,
  ChangeUserPasswordDto,
  EditUserProfileDto,
  mapAddUserDto,
} from '../interface/http/user.request';
import {
  UserResponseDto,
  UserFullResponseDto,
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

  async getByUsername(username: string): Promise<UserFullResponseDto> {
    this.validationService.validate(UserValidation.GET_BY_USERNAME, username);

    const data = await this.userRepository.getByUsername(username);

    return {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      role: data.role,
      tokenVersion: data.tokenVersion,
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

    // verify the refresh token
    await this.authService.get(refreshToken);

    const user = await this.getById(id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return await this.prismaService.$transaction(async (tx) => {
      Promise.all([
        this.userRepository.changeEmail(id, email),
        this.authService.revokeAllByUserId(id),
      ]);

      // return new access and refresh token
      return await this.authService.login({ ...user, email });
    });
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

    // verify the refresh token
    await this.authService.get(refreshToken);

    const user = await this.getById(id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return await this.prismaService.$transaction(async (tx) => {
      Promise.all([
        this.userRepository.changeUsername(id, username),
        this.authService.revokeAllByUserId(id),
      ]);

      // return new access and refresh token
      return await this.authService.login({ ...user, username });
    });
  }

  async changePassword(id: string, req: ChangeUserPasswordDto): Promise<void> {
    this.validationService.validate(UserValidation.CHANGE_PASSWORD, {
      id,
      ...req,
    });

    const bcrypt = new Bcrypt();
    const { password: hashedPassword } = await this.userRepository.getById(id);

    // check if the old password is correct
    const isOldPasswordCorrect = await bcrypt.compare(
      req.oldPassword,
      hashedPassword,
    );
    if (!isOldPasswordCorrect) {
      throw new BadRequestException('old password incorrect');
    }

    // prevent using the same password
    const isSamePassword = await bcrypt.compare(
      req.newPassword,
      hashedPassword,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'new password cannot be the same as the old password',
      );
    }

    const newHashedPassword = await bcrypt.hash(req.newPassword);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.prismaService.$transaction(async (tx) =>
      Promise.all([
        this.userRepository.changePassword(id, newHashedPassword),

        // revoke all authentication tokens
        this.authService.revokeAllByUserId(id),
      ]),
    );
  }
}
