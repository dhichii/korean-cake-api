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
  StatusResponseDto,
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

@Controller('/api/v1/process')
@UseGuards(JwtGuard, new RolesGuard([Role.SUPER, Role.ADMIN]))
export class ProcessController {
  constructor(
    @Inject('IProcessService') private processService: IProcessService,
  ) {}

  @Post()
  @HttpCode(201)
  async add(
    @Body() req: AddProcessDto,
  ): Promise<ApiResponseDto<AddProcessResponseDto>> {
    const data = await this.processService.add(req);

    return new ApiResponseDto<AddProcessResponseDto>(data);
  }

  @Get()
  @HttpCode(200)
  async getAll(): Promise<ApiResponseDto<GetAllProcessResponseDto[]>> {
    const data = await this.processService.getAll();

    return new ApiResponseDto<GetAllProcessResponseDto[]>(data);
  }

  @Put(':id')
  @HttpCode(200)
  async editById(
    @Param('id') id: string,
    @Body() req: EditProcessDto,
  ): Promise<StatusResponseDto> {
    await this.processService.editById(id, req);

    return new StatusResponseDto();
  }

  @Patch('steps')
  @HttpCode(200)
  async editSteps(
    @Body() req: EditProcessStepDto[],
  ): Promise<StatusResponseDto> {
    await this.processService.editSteps(req);

    return new StatusResponseDto();
  }

  @Delete(':id')
  @HttpCode(200)
  async deleteById(@Param('id') id: string): Promise<StatusResponseDto> {
    await this.processService.deleteById(id);

    return new StatusResponseDto();
  }
}
