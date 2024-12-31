import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../domain/user.repository.interface';
import { AddUserDto, mapAddUserDto } from '../interface/http/user.request';
import {
  UserResponseDto,
  UserWithPasswordResponseDto,
} from '../interface/http/user.response';
import { IUserService } from '../domain/user.service.interface';
import { Bcrypt } from '../../utils/Bcrypt';
import { ValidationService } from '../../common/validation.service';
import { UserValidation } from './user.validation';
import { Role } from '@prisma/client';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject('IUserRepository') private userRepository: IUserRepository,
    private validationService: ValidationService,
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

  async deleteById(id: string): Promise<void> {
    this.validationService.validate(UserValidation.DELETE_BY_ID, id);

    await this.userRepository.verify(id);
    await this.userRepository.deleteById(id);
  }

  async changeEmail(id: string, email: string): Promise<void> {
    this.validationService.validate(UserValidation.CHANGE_EMAIL, { id, email });

    await this.userRepository.verify(id);
    await this.userRepository.changeEmail(id, email);
  }

  async changeUsername(id: string, username: string): Promise<void> {
    this.validationService.validate(UserValidation.CHANGE_USERNAME, {
      id,
      username,
    });

    await this.userRepository.verify(id);
    await this.userRepository.changeUsername(id, username);
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
