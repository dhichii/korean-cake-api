import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { IAdminService } from 'src/admin/domain/admin.service.interface';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/roles.guard';
import { CreateAdminDto } from './admin.request';
import {
  CreateAdminResponseDto,
  GetAllAdminResponseDto,
} from './admin.response';
import { ApiResponseDto, StatusResponseDto } from 'src/common/api-response.dto';

@Controller('admin')
export class AdminController {
  constructor(@Inject('IAdminService') private adminService: IAdminService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtGuard, new RolesGuard([Role.SUPER]))
  async add(
    @Body() req: CreateAdminDto,
  ): Promise<ApiResponseDto<CreateAdminResponseDto>> {
    const data = await this.adminService.add(req);

    return new ApiResponseDto<CreateAdminResponseDto>().setData(data);
  }

  @Get()
  @HttpCode(200)
  @UseGuards(JwtGuard, new RolesGuard([Role.SUPER]))
  async getAll(): Promise<ApiResponseDto<GetAllAdminResponseDto[]>> {
    const data = await this.adminService.getAll();

    return new ApiResponseDto<GetAllAdminResponseDto[]>().setData(data);
  }

  @Delete()
  @HttpCode(200)
  @UseGuards(JwtGuard, new RolesGuard([Role.SUPER]))
  async deleteById(@Param('id') id: string): Promise<StatusResponseDto> {
    await this.adminService.delete(id);

    return new StatusResponseDto();
  }
}
