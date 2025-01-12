import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../../../auth/guards/jwt.guard';
import { IOrderService } from '../../../order/domain/order.service.interface';
import {
  ApiResponseDto,
  PaginationPayload,
  PaginationResponseDto,
  StatusResponseDto,
} from '../../../common/api-response.dto';
import {
  AddOrderResponseDto,
  GetAllOrderResponseDto,
  GetOrderByIdResponseDto,
} from './order.response';
import {
  AddOrderDto,
  EditOrderDto,
  EditOrderProgressDto,
  GetAllOrderDto,
} from './order.request';
import { User } from '../../../common/decorator/user.decorator';

@Controller('/api/v1/orders')
@UseGuards(JwtGuard)
export class OrderController {
  constructor(@Inject('IOrderService') private orderService: IOrderService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'pictures', maxCount: 3 }]))
  async add(
    @UploadedFiles() files,
    @User('id') userId: string,
    @Body() body: AddOrderDto,
  ): Promise<ApiResponseDto<AddOrderResponseDto>> {
    const pictures = files['pictures'];
    if (!pictures || pictures.length < 1) {
      throw new BadRequestException({
        path: ['pictures'],
        message: 'Required',
      });
    }

    const data = await this.orderService.add(body, userId, pictures);

    return new ApiResponseDto(data);
  }

  @Get()
  async getAll(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @User('id') userId: string,
  ): Promise<PaginationResponseDto<GetAllOrderResponseDto[]>> {
    limit = limit || 10;
    page = page || 1;
    const payload: GetAllOrderDto = {
      userId,
      limit,
      page,
    };
    const [totalResult, data] = await this.orderService.getAll(payload);
    const paginationPayload: PaginationPayload<GetAllOrderResponseDto[]> = {
      limit,
      page,
      totalResult,
      data,
    };

    return new PaginationResponseDto(paginationPayload);
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<ApiResponseDto<GetOrderByIdResponseDto>> {
    const data = await this.orderService.getById(id, userId);

    return new ApiResponseDto(data);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'addedPictures', maxCount: 3 }]),
  )
  async editById(
    @Param('id') id: string,
    @UploadedFiles() files,
    @User('id') userId: string,
    @Body() body: EditOrderDto,
  ): Promise<StatusResponseDto> {
    const addedPictures = files['addedPictures'];
    if (!addedPictures || addedPictures.length < 1) {
      throw new BadRequestException({
        path: ['pictures'],
        message: 'Required',
      });
    }

    body.addedPictures = addedPictures;
    const data = await this.orderService.editById(id, userId, body);

    return new ApiResponseDto(data);
  }

  @Delete(':id')
  async deleteById(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<StatusResponseDto> {
    await this.orderService.deleteById(id, userId);

    return new StatusResponseDto();
  }

  @Put(':id/progresses/:progressId')
  async editProgressById(
    @Param('id') orderId: string,
    @Param('progressId') progressId: string,
    @User('id') userId: string,
    @Body() body: EditOrderProgressDto,
  ): Promise<StatusResponseDto> {
    await this.orderService.editProgressById(progressId, orderId, userId, body);

    return new StatusResponseDto();
  }
}
