import {
  GetAllOrderDto,
  OrderPictureDto,
} from '../interface/http/order.request';
import {
  AddOrderResponseDto,
  GetAllOrderResponseDto,
  GetOrderByIdResponseDto,
} from '../interface/http/order.response';
import { EditOrderEntity, OrderEntity } from './order.entity';

export interface IOrderRepository {
  add(
    data: OrderEntity,
    pictures: OrderPictureDto[],
    progresses: string[],
  ): Promise<AddOrderResponseDto>;
  getAll(req: GetAllOrderDto): Promise<[number, GetAllOrderResponseDto[]]>;
  getById(id: string, userId: string): Promise<GetOrderByIdResponseDto>;
  editById(
    id: string,
    data: EditOrderEntity,
    newPictures: OrderPictureDto[],
  ): Promise<void>;
  deleteById(id: string, userId: string): Promise<void>;
  addProgresses(orderId: string, ids: string[]): Promise<void>;
  editProgressById(
    id: string,
    orderId: string,
    isFinish: boolean,
  ): Promise<void>;
  deleteProgresses(orderId: string, ids: string[]): Promise<void>;
  verify(id: string, userId: string): Promise<void>;
  verifyProgress(id: string, orderId: string): Promise<void>;
}
