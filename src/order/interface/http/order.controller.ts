import {
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
import {
  FileFieldsInterceptor,
  NoFilesInterceptor,
} from '@nestjs/platform-express';
import { JwtGuard } from '../../../auth/guards/jwt.guard';
import { IOrderService } from '../../../order/domain/order.service.interface';
import {
  ApiResponseDto,
  InternalServerResponse,
  PaginationPayload,
  PaginationResponseDto,
  StatusResponseDto,
  UnauthorizedResponse,
  ValidationErrorResponse,
} from '../../../common/api-response.dto';
import {
  AddOrderResponseDto,
  GetAllOrderResponseDto,
  GetOrderByIdResponseDto,
  OrderStatus,
} from './order.response';
import {
  AddOrderDto,
  EditOrderDto,
  EditOrderProgressDto,
  GetAllOrderDto,
} from './order.request';
import { User } from '../../../common/decorator/user.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { createFileFilter, MimeType } from '../../../utils/file-filter';
import { OptionalParseIntPipe } from '../../../common/optional-parse-int.pipe';

@Controller('/api/v1/orders')
@UseGuards(JwtGuard)
@ApiExtraModels(
  ApiResponseDto,
  AddOrderResponseDto,
  PaginationResponseDto,
  GetAllOrderResponseDto,
  GetOrderByIdResponseDto,
)
export class OrderController {
  constructor(@Inject('IOrderService') private orderService: IOrderService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'pictures', maxCount: 3 }], {
      fileFilter: createFileFilter([MimeType.JPG, MimeType.PNG]),
    }),
  )
  @ApiOperation({ summary: 'add new order' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('Authorization')
  @ApiCreatedResponse({
    description: 'Successfully add new order',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(AddOrderResponseDto),
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
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  async add(
    @UploadedFiles() files,
    @User('id') userId: string,
    @Body() body: AddOrderDto,
  ): Promise<ApiResponseDto<AddOrderResponseDto>> {
    body.pictures = files?.pictures;
    const data = await this.orderService.add(body, userId);

    return new ApiResponseDto(data);
  }

  @Get()
  @ApiOperation({ summary: 'get all orders' })
  @ApiBearerAuth('Authorization')
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderStatus,
    enumName: 'OrderStatus',
    description: 'filter orders by status',
  })
  @ApiOkResponse({
    description: 'Successfully get all orders',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationResponseDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(GetAllOrderResponseDto) },
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
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  async getAll(
    @User('id') userId: string,
    @Query('limit', new OptionalParseIntPipe(10)) limit: number,
    @Query('page', new OptionalParseIntPipe(1)) page: number,
    @Query('status') status: OrderStatus = OrderStatus.ALL,
  ): Promise<PaginationResponseDto<GetAllOrderResponseDto[]>> {
    const payload: GetAllOrderDto = {
      userId,
      limit,
      page,
      status,
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
  @ApiOperation({ summary: 'get order by id' })
  @ApiBearerAuth('Authorization')
  @ApiOkResponse({
    description: 'Successfully order by id',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(GetOrderByIdResponseDto) },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid Token or Expired',
    type: UnauthorizedResponse,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  async getById(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<ApiResponseDto<GetOrderByIdResponseDto>> {
    const data = await this.orderService.getById(id, userId);

    return new ApiResponseDto(data);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'addedPictures', maxCount: 3 }], {
      fileFilter: createFileFilter([MimeType.JPG, MimeType.PNG]),
    }),
  )
  @ApiOperation({ summary: 'edit order by id' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('Authorization')
  @ApiOkResponse({
    description: 'Successfully edit order by id',
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
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  async editById(
    @Param('id') id: string,
    @UploadedFiles() files,
    @User('id') userId: string,
    @Body() body: EditOrderDto,
  ): Promise<StatusResponseDto> {
    body.addedPictures = files?.addedPictures ?? [];
    const data = await this.orderService.editById(id, userId, body);

    return new ApiResponseDto(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'delete order by id' })
  @ApiBearerAuth('Authorization')
  @ApiOkResponse({
    description: 'Successfully delete order by id',
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
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  async deleteById(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<StatusResponseDto> {
    await this.orderService.deleteById(id, userId);

    return new StatusResponseDto();
  }

  @Put(':id/progresses/:progressId')
  @UseInterceptors(NoFilesInterceptor())
  @ApiOperation({ summary: 'edit order progress by id' })
  @ApiBearerAuth('Authorization')
  @ApiOkResponse({
    description: 'Successfully edit order progress by id',
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
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
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
