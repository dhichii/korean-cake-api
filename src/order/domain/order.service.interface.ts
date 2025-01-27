import {
  AddOrderDto,
  EditOrderDto,
  EditOrderProgressDto,
  GetAllOrderDto,
} from '../interface/http/order.request';
import {
  AddOrderResponseDto,
  GetAllOrderResponseDto,
  GetOrderByIdResponseDto,
} from '../interface/http/order.response';

export interface IOrderService {
  add(req: AddOrderDto, userId: string): Promise<AddOrderResponseDto>;
  getAll(req: GetAllOrderDto): Promise<[number, GetAllOrderResponseDto[]]>;
  getById(id: string, userId: string): Promise<GetOrderByIdResponseDto>;
  editById(id: string, userId: string, req: EditOrderDto): Promise<void>;
  deleteById(id: string, userId: string): Promise<void>;
  editProgressById(
    id: string,
    orderId: string,
    userId: string,
    req: EditOrderProgressDto,
  ): Promise<void>;
}
