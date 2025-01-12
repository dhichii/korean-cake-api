export class AddOrderResponseDto {
  id: string;
}

export enum OrderStatus {
  INPROGRESS = 'Proses',
  COMPLETED = 'Selesai',
}

export class GetAllOrderResponseDto {
  id: string;
  status: OrderStatus;
  size: number;
  layer?: number;
  isUseTopper: boolean;
  pickupTime: string;
  text: string;
  textColor: string;
  price: number;
  downPayment: number;
  remainingPayment: number;
  telp: string;
  notes?: string;
  pictures: OrderPictureResponseDto[];
}

export class GetOrderByIdResponseDto {
  id: string;
  status: OrderStatus;
  size: number;
  layer?: number;
  isUseTopper: boolean;
  pickupTime: string;
  text: string;
  textColor: string;
  price: number;
  downPayment: number;
  remainingPayment: number;
  telp: string;
  notes?: string;
  pictures: OrderPictureResponseDto[];
  progresses: OrderProgressResponseDto[];
}

export class OrderPictureResponseDto {
  id: string;
  url: string;
}

export class OrderProgressResponseDto {
  id: string;
  name: string;
  step: number;
}
