import { OrderEntity } from 'src/order/domain/order.entity';
import { v4 as uuid } from 'uuid';

export class AddOrderDto {
  size: number;
  layer?: number;
  isUseTopper: boolean;
  pickupTime: number;
  text: string;
  textColor: string;
  price: number;
  downPayment: number;
  remainingPayment: number;
  telp: string;
  notes?: string;
  progresses: string[];
}

export function mapAddOrderDto(userId: string, req: AddOrderDto): OrderEntity {
  return {
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
  };
}

export class OrderPictureDto {
  id: string;
  url: string;
}

export class GetAllOrderDto {
  limit: number;
  page: number;
}

export class EditOrderDto {
  size: number;
  layer?: number;
  isUseTopper: boolean;
  pickupTime: number;
  text: string;
  textColor: string;
  price: number;
  downPayment: number;
  remainingPayment: number;
  telp: string;
  notes?: string;
  deletedPictures: string[];
  addedProgresses: string[];
  deletedProgresses: string[];
}
