import {
  EditOrderEntity,
  OrderEntity,
} from '../../../order/domain/order.entity';
import { v4 as uuid } from 'uuid';

export class AddOrderDto {
  pictures: Express.Multer.File[];
  size: number;
  layer?: number;
  isUseTopper: boolean;
  pickupTime: bigint;
  text: string;
  textColor: string;
  price: number;
  downPayment: number;
  remainingPayment: number;
  telp: string;
  notes?: string;
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
  remainingPayment: req.remainingPayment,
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
  size: number;
  layer?: number;
  isUseTopper: boolean;
  pickupTime: bigint;
  text: string;
  textColor: string;
  price: number;
  downPayment: number;
  remainingPayment: number;
  telp: string;
  notes?: string;
  addedPictures: Express.Multer.File[];
  deletedPictures: string[];
  addedProgresses: string[];
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
  remainingPayment: req.remainingPayment,
  telp: req.telp,
  notes: req.notes,
});

export class EditOrderProgressDto {
  isFinish: boolean;
}
