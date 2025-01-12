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
import { JwtGuard } from '../../../auth/guards/jwt.guard';
import {
  ApiResponseDto,
  ForbiddenResponse,
  InternalServerResponse,
  StatusResponseDto,
  UnauthorizedResponse,
  ValidationErrorResponse,
} from '../../../common/api-response.dto';
import { IProcessService } from '../../../process/domain/process.service.interface';
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
import { User } from '../../../common/decorator/user.decorator';

@Controller('/api/v1/processes')
@UseGuards(JwtGuard)
@ApiExtraModels(ApiResponseDto, AddProcessResponseDto, GetAllProcessResponseDto)
export class ProcessController {
  constructor(
    @Inject('IProcessService') private processService: IProcessService,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'add new process',
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
    @User('id') userId: string,
    @Body() req: AddProcessDto,
  ): Promise<ApiResponseDto<AddProcessResponseDto>> {
    const data = await this.processService.add(userId, req);

    return new ApiResponseDto<AddProcessResponseDto>(data);
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'get all processes',
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
  async getAll(
    @User('id') userId: string,
  ): Promise<ApiResponseDto<GetAllProcessResponseDto[]>> {
    const data = await this.processService.getAll(userId);

    return new ApiResponseDto<GetAllProcessResponseDto[]>(data);
  }

  @Put(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'edit process by id',
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
    @User('id') userId: string,
    @Body() req: EditProcessDto,
  ): Promise<StatusResponseDto> {
    await this.processService.editById(id, userId, req);

    return new StatusResponseDto();
  }

  @Patch('steps')
  @HttpCode(200)
  @ApiOperation({
    summary: 'edit process steps',
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
    @User('id') userId: string,
    @Body() req: EditProcessStepDto[],
  ): Promise<StatusResponseDto> {
    await this.processService.editSteps(userId, req);

    return new StatusResponseDto();
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'delete process by id',
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
  async deleteById(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<StatusResponseDto> {
    await this.processService.deleteById(id, userId);

    return new StatusResponseDto();
  }
}
