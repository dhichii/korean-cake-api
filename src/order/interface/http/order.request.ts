import { ApiProperty } from '@nestjs/swagger';
import {
  EditOrderEntity,
  OrderEntity,
} from '../../../order/domain/order.entity';
import { v4 as uuid } from 'uuid';
import { OrderStatus } from './order.response';

export class AddOrderDataDto {
  @ApiProperty({ minimum: 10, description: 'must be at least 10', example: 16 })
  size: number;

  @ApiProperty({ required: false, example: 2, nullable: true })
  layer?: number;

  @ApiProperty({ example: true })
  isUseTopper: boolean;

  @ApiProperty({ example: '1730952000000' })
  pickupTime: string;

  @ApiProperty({ maxLength: 255, example: 'Happy Birthday' })
  text: string;

  @ApiProperty({ maxLength: 120, example: 'Red' })
  textColor: string;

  @ApiProperty({ format: 'double', example: 20000 })
  price: number;

  @ApiProperty({ format: 'double', example: 20000 })
  downPayment: number;

  @ApiProperty({ example: '6289898888' })
  telp: string;

  @ApiProperty({ required: false, example: 'call me', nullable: true })
  notes?: string;

  @ApiProperty({
    type: [String],
    description: 'Array of process IDs (UUIDs)',
    example: [],
  })
  progresses: string[];
}

export class AddOrderDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    maxItems: 3,
  })
  pictures: Express.Multer.File[];

  @ApiProperty({ type: AddOrderDataDto })
  data: string;
}

export const mapAddOrderDto = (
  userId: string,
  req: AddOrderDataDto,
): OrderEntity => ({
  id: uuid(),
  userId,
  size: req.size,
  layer: req.layer,
  isUseTopper: req.isUseTopper,
  pickupTime: BigInt(req.pickupTime),
  text: req.text,
  textColor: req.textColor,
  price: req.price,
  downPayment: req.downPayment,
  remainingPayment: req.price - req.downPayment,
  telp: req.telp,
  notes: req.notes,
});

export class OrderPictureDto {
  id: string;
  url: string;
}

export class GetAllOrderDto {
  userId: string;
  limit: number;
  page: number;
  status: OrderStatus;
}

export class EditOrderDataDto {
  @ApiProperty({ minimum: 10, description: 'must be at least 10', example: 16 })
  size: number;

  @ApiProperty({ required: false, example: 2, nullable: true })
  layer?: number;

  @ApiProperty({ example: false })
  isUseTopper: boolean;

  @ApiProperty({ example: '1730952000000' })
  pickupTime: string;

  @ApiProperty({ maxLength: 255, example: 'Pyy Birthday' })
  text: string;

  @ApiProperty({ maxLength: 120, example: 'Blue' })
  textColor: string;

  @ApiProperty({ format: 'double', example: 20000 })
  price: number;

  @ApiProperty({ format: 'double', example: 20000 })
  downPayment: number;

  @ApiProperty({ example: '6289898888' })
  telp: string;

  @ApiProperty({ required: false, example: 'call me', nullable: true })
  notes?: string;

  @ApiProperty({
    type: [String],
    description: 'Array of picture IDs. Can be empty.',
    example: [],
  })
  deletedPictures: string[];

  @ApiProperty({
    type: [String],
    description: 'Array of process IDs (UUIDs). Can be empty.',
    example: [],
  })
  addedProgresses: string[];

  @ApiProperty({
    type: [String],
    description: 'Array of process IDs (UUIDs). Can be empty.',
    example: [],
  })
  deletedProgresses: string[];
}

export class EditOrderDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
    maxItems: 3,
  })
  addedPictures: Express.Multer.File[];

  @ApiProperty({ type: EditOrderDataDto })
  data: string;
}

export const mapEditOrderDto = (req: EditOrderDataDto): EditOrderEntity => ({
  size: req.size,
  layer: req.layer,
  isUseTopper: req.isUseTopper,
  pickupTime: BigInt(req.pickupTime),
  text: req.text,
  textColor: req.textColor,
  price: req.price,
  downPayment: req.downPayment,
  remainingPayment: req.price - req.downPayment,
  telp: req.telp,
  notes: req.notes,
});

export class EditOrderProgressDto {
  @ApiProperty({ example: false })
  isFinish: boolean;
}
