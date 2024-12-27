import { Inject, Injectable } from '@nestjs/common';
import { IAdminService } from '../domain/admin.service.interface';
import { IUserService } from '../../user/domain/user.service.interface';
import {
  CreateAdminDto,
  mapCreateAdminDto,
} from '../interface/http/admin.request';
import {
  CreateAdminResponseDto,
  GetAllAdminResponseDto,
} from '../interface/http/admin.response';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService implements IAdminService {
  constructor(@Inject('IUserService') private userService: IUserService) {}

  async add(req: CreateAdminDto): Promise<CreateAdminResponseDto> {
    const mappedReq = mapCreateAdminDto(req);
    const { id } = await this.userService.add(mappedReq);

    return {
      id,
      password: mappedReq.password,
    };
  }

  async getAll(): Promise<GetAllAdminResponseDto[]> {
    const res = await this.userService.getAll(Role.ADMIN);

    return res.map((v) => ({
      id: v.id,
      name: v.name,
      username: v.username,
      email: v.email,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.userService.deleteById(id);
  }
}
