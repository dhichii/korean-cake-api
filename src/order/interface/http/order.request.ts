import { ApiProperty } from '@nestjs/swagger';
import {
  EditOrderEntity,
  OrderEntity,
} from '../../../order/domain/order.entity';
import { v4 as uuid } from 'uuid';

export class AddOrderDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  pictures: Express.Multer.File[];

  @ApiProperty({ example: 16 })
  size: number;

  @ApiProperty({ required: false, example: 2 })
  layer?: number;

  @ApiProperty({ example: true })
  isUseTopper: boolean;

  @ApiProperty({ example: 1730952000000 })
  pickupTime: bigint;

  @ApiProperty({ example: 'Happy Birthday' })
  text: string;

  @ApiProperty({ example: 'Red' })
  textColor: string;

  @ApiProperty({ format: 'double', example: 20000 })
  price: number;

  @ApiProperty({ format: 'double', example: 20000 })
  downPayment: number;

  @ApiProperty({ example: '6289898888' })
  telp: string;

  @ApiProperty({ required: false, example: 'call me' })
  notes?: string;

  @ApiProperty({ type: 'array', items: { type: 'string' } })
  progresses: string[];
}

export const mapAddOrderDto = (
  userId: string,
  req: AddOrderDto,
): OrderEntity => ({
  id: uuid(),
  userId,
  size: req.size,
  layer: req.layer,
  isUseTopper: req.isUseTopper,
  pickupTime: req.pickupTime,
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
}

export class EditOrderDto {
  @ApiProperty({ example: 16 })
  size: number;

  @ApiProperty({ required: false, example: 2 })
  layer?: number;

  @ApiProperty({ example: false })
  isUseTopper: boolean;

  @ApiProperty({ example: 1730952000000 })
  pickupTime: bigint;

  @ApiProperty({ example: 'Pyy Birthday' })
  text: string;

  @ApiProperty({ example: 'Blue' })
  textColor: string;

  @ApiProperty({ format: 'double', example: 20000 })
  price: number;

  @ApiProperty({ format: 'double', example: 20000 })
  downPayment: number;

  @ApiProperty({ example: '6289898888' })
  telp: string;

  @ApiProperty({ required: false, example: 'call me' })
  notes?: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  addedPictures: Express.Multer.File[];

  @ApiProperty({ type: 'array', items: { type: 'string' }, required: false })
  deletedPictures: string[];

  @ApiProperty({ type: 'array', items: { type: 'string' }, required: false })
  addedProgresses: string[];

  @ApiProperty({ type: 'array', items: { type: 'string' }, required: false })
  deletedProgresses: string[];
}

export const mapEditOrderDto = (req: EditOrderDto): EditOrderEntity => ({
  size: req.size,
  layer: req.layer,
  isUseTopper: req.isUseTopper,
  pickupTime: req.pickupTime,
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
