import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtGuard } from '../../../auth/guards/jwt.guard';
import { RolesGuard } from '../../../common/roles.guard';
import {
  ApiResponseDto,
  ForbiddenResponse,
  InternalServerResponse,
  StatusResponseDto,
  UnauthorizedResponse,
  ValidationErrorResponse,
} from '../../../common/api-response.dto';
import { IProcessService } from 'src/process/domain/process.service.interface';
import {
  AddProcessDto,
  EditProcessDto,
  EditProcessStepDto,
} from './process.request';
import {
  AddProcessResponseDto,
  GetAllProcessResponseDto,
} from './process.response';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

@Controller('/api/v1/process')
@UseGuards(JwtGuard, new RolesGuard([Role.SUPER, Role.ADMIN]))
@ApiExtraModels(ApiResponseDto, AddProcessResponseDto, GetAllProcessResponseDto)
export class ProcessController {
  constructor(
    @Inject('IProcessService') private processService: IProcessService,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'add new process',
    description: 'for super/admin only',
  })
  @ApiBearerAuth('Authorization')
  @ApiCreatedResponse({
    description: 'Successfully add new process',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(AddProcessResponseDto),
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
    @Body() req: AddProcessDto,
  ): Promise<ApiResponseDto<AddProcessResponseDto>> {
    const data = await this.processService.add(req);

    return new ApiResponseDto<AddProcessResponseDto>(data);
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'get all processes',
    description: 'for super/admin only',
  })
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
              items: { $ref: getSchemaPath(GetAllProcessResponseDto) },
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
  async getAll(): Promise<ApiResponseDto<GetAllProcessResponseDto[]>> {
    const data = await this.processService.getAll();

    return new ApiResponseDto<GetAllProcessResponseDto[]>(data);
  }

  @Put(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'edit process by id',
    description: 'for super/admin only',
  })
  @ApiBearerAuth('Authorization')
  @ApiOkResponse({
    description: 'Successfully edit process by id',
    type: StatusResponseDto,
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
  async editById(
    @Param('id') id: string,
    @Body() req: EditProcessDto,
  ): Promise<StatusResponseDto> {
    await this.processService.editById(id, req);

    return new StatusResponseDto();
  }

  @Patch('steps')
  @HttpCode(200)
  @ApiOperation({
    summary: 'edit process steps',
    description: 'for super/admin only',
  })
  @ApiBearerAuth('Authorization')
  @ApiBody({ type: [EditProcessStepDto] })
  @ApiOkResponse({
    description: 'Successfully edit process steps',
    type: StatusResponseDto,
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
  async editSteps(
    @Body() req: EditProcessStepDto[],
  ): Promise<StatusResponseDto> {
    await this.processService.editSteps(req);

    return new StatusResponseDto();
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'delete process by id',
    description: 'for super/admin only',
  })
  @ApiBearerAuth('Authorization')
  @ApiOkResponse({
    description: 'Successfully detele process by id',
    type: StatusResponseDto,
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
  async deleteById(@Param('id') id: string): Promise<StatusResponseDto> {
    await this.processService.deleteById(id);

    return new StatusResponseDto();
  }
}
