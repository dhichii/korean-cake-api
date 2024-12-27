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
import {
  ApiResponseDto,
  ForbiddenResponse,
  InternalServerResponse,
  StatusResponseDto,
  UnauthorizedResponse,
  ValidationErrorResponse,
} from 'src/common/api-response.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

@Controller('/api/v1/admin')
@ApiExtraModels(ApiResponseDto, CreateAdminResponseDto, GetAllAdminResponseDto)
export class AdminController {
  constructor(@Inject('IAdminService') private adminService: IAdminService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtGuard, new RolesGuard([Role.SUPER]))
  @ApiOperation({ summary: 'add new admin' })
  @ApiBearerAuth('Authorization')
  @ApiCreatedResponse({
    description: 'Successfully add new admin',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(CreateAdminResponseDto),
            },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation Error',
    type: ValidationErrorResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid Token or Expired',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  async add(
    @Body() req: CreateAdminDto,
  ): Promise<ApiResponseDto<CreateAdminResponseDto>> {
    const data = await this.adminService.add(req);

    return new ApiResponseDto<CreateAdminResponseDto>().setData(data);
  }

  @Get()
  @HttpCode(200)
  @UseGuards(JwtGuard, new RolesGuard([Role.SUPER]))
  @ApiOperation({ summary: 'get all admin' })
  @ApiBearerAuth('Authorization')
  @ApiOkResponse({
    description: 'Successfully get all admin',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(GetAllAdminResponseDto) },
            },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid Token or Expired',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  async getAll(): Promise<ApiResponseDto<GetAllAdminResponseDto[]>> {
    const data = await this.adminService.getAll();

    return new ApiResponseDto<GetAllAdminResponseDto[]>().setData(data);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtGuard, new RolesGuard([Role.SUPER]))
  @ApiOperation({ summary: 'delete admin by id' })
  @ApiBearerAuth('Authorization')
  @ApiOkResponse({
    description: 'Successfully delete admin',
    type: StatusResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid Token or Expired',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  async deleteById(@Param('id') id: string): Promise<StatusResponseDto> {
    await this.adminService.delete(id);

    return new StatusResponseDto();
  }
}
