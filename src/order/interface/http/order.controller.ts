import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../../../auth/guards/jwt.guard';
import { IOrderService } from '../../../order/domain/order.service.interface';
import { JWTSignPayload } from '../../../auth/interface/http/auth.response';
import { Request } from 'express';
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

@Controller('/api/v1/orders')
@UseGuards(JwtGuard)
export class OrderController {
  constructor(@Inject('IOrderService') private orderService: IOrderService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'pictures', maxCount: 3 }]))
  async add(@Req() req: Request): Promise<ApiResponseDto<AddOrderResponseDto>> {
    const pictures = req.files['pictures'];
    const user = req.user as JWTSignPayload;
    const body = req.body;
    const payload: AddOrderDto = {
      ...body,
      size: parseInt(body.size),
      layer: parseInt(body.layer) ?? null,
      isUseTopper: JSON.parse(body.isUseTopper),
      pickupTime: BigInt(body.pickupTime),
      price: parseFloat(body.price),
      downPayment: parseFloat(body.downPayment),
      remainingPayment: parseFloat(body.remainingPayment),
      notes:
        body.notes === 'null' || body.notes === 'undefined' ? null : body.notes,
    };
    const data = await this.orderService.add(payload, user.id, pictures);

    return new ApiResponseDto(data);
  }

  @Get()
  async getAll(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Req() req: Request,
  ): Promise<PaginationResponseDto<GetAllOrderResponseDto[]>> {
    const user = req.user as JWTSignPayload;
    limit = limit || 10;
    page = page || 1;
    const payload: GetAllOrderDto = {
      userId: user.id,
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
    @Req() req: Request,
  ): Promise<ApiResponseDto<GetOrderByIdResponseDto>> {
    const user = req.user as JWTSignPayload;
    const data = await this.orderService.getById(id, user.id);

    return new ApiResponseDto(data);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'addedPictures', maxCount: 3 }]),
  )
  async editById(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<StatusResponseDto> {
    const user = req.user as JWTSignPayload;
    const addedPictures = req.files['addedPictures'];
    const payload: EditOrderDto = { ...req.body, addedPictures };
    const data = await this.orderService.editById(id, user.id, payload);

    return new ApiResponseDto(data);
  }

  @Delete(':id')
  async deleteById(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<StatusResponseDto> {
    const user = req.user as JWTSignPayload;
    await this.orderService.deleteById(id, user.id);

    return new StatusResponseDto();
  }

  @Put(':id/progresses/:progressId')
  async editProgressById(
    @Param('id') orderId: string,
    @Param('progressId') progressId: string,
    @Req() req: Request,
  ): Promise<StatusResponseDto> {
    const user = req.user as JWTSignPayload;
    const payload: EditOrderProgressDto = { isFinish: req.body.isFinish };
    await this.orderService.editProgressById(
      progressId,
      orderId,
      user.id,
      payload,
    );

    return new StatusResponseDto();
  }
}
