import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { IUserRepository } from '../domain/user.repository.interface';
import {
  AddUserDto,
  ChangeEmailDto,
  ChangeUsernameDto,
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

  async changeEmail(id: string, req: ChangeEmailDto): Promise<void> {
    this.validationService.validate(UserValidation.CHANGE_EMAIL, {
      id,
      ...req,
    });

    await this.isPasswordMatch(req.password, id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.prismaService.$transaction(async (tx) => {
      Promise.all([
        this.userRepository.changeEmail(id, req.email),
        this.authService.revokeAllByUserId(id),
      ]);
    });
  }

  async changeUsername(id: string, req: ChangeUsernameDto): Promise<void> {
    this.validationService.validate(UserValidation.CHANGE_USERNAME, {
      id,
      ...req,
    });

    await this.isPasswordMatch(req.password, id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.prismaService.$transaction(async (tx) => {
      Promise.all([
        this.userRepository.changeUsername(id, req.username),
        this.authService.revokeAllByUserId(id),
      ]);
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
    await this.isPasswordMatch(req.oldPassword, id, 'old password incorrect');

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

  private async isPasswordMatch(
    password: string,
    userId: string,
    errorMessage: string = 'password incorrect',
  ) {
    const bcrypt = new Bcrypt();
    const { password: hashedPassword } =
      await this.userRepository.getById(userId);
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      throw new BadRequestException(errorMessage);
    }
  }
}
