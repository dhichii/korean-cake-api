import { ApiProperty } from '@nestjs/swagger';

export class AddOrderResponseDto {
  @ApiProperty({ example: 'e6314752-c753-47dc-bc82-eae480d1b094' })
  id: string;
}

export enum OrderStatus {
  INPROGRESS = 'Proses',
  COMPLETED = 'Selesai',
}

export class OrderPictureResponseDto {
  @ApiProperty({ example: 'e6314752-c753-47dc-bc82-eae480d1b094' })
  id: string;

  @ApiProperty({ example: 'https://example.com/some-id' })
  url: string;
}

export class OrderProgressResponseDto {
  @ApiProperty({ example: 'e6314752-c753-47dc-bc82-eae480d1b094' })
  id: string;

  @ApiProperty({ example: 'example' })
  name: string;

  @ApiProperty({ example: 1 })
  step: number;
}

export class GetAllOrderResponseDto {
  @ApiProperty({ example: 'e6314752-c753-47dc-bc82-eae480d1b094' })
  id: string;

  @ApiProperty({ example: 'Proses' })
  status: OrderStatus;

  @ApiProperty({ example: 16 })
  size: number;

  @ApiProperty({ example: null })
  layer?: number;

  @ApiProperty({ example: false })
  isUseTopper: boolean;

  @ApiProperty({ example: '1730952000000' })
  pickupTime: string;

  @ApiProperty({ example: 'Happy Birthday' })
  text: string;

  @ApiProperty({ example: 'Red' })
  textColor: string;

  @ApiProperty({ format: 'double', example: 20000 })
  price: number;

  @ApiProperty({ format: 'double', example: 20000 })
  downPayment: number;

  @ApiProperty({ format: 'double', example: 20000 })
  remainingPayment: number;

  @ApiProperty({ example: '6289898888' })
  telp: string;

  @ApiProperty({ example: null })
  notes?: string;

  @ApiProperty({ type: [OrderPictureResponseDto] })
  pictures: OrderPictureResponseDto[];
}

export class GetOrderByIdResponseDto {
  @ApiProperty({ example: 'e6314752-c753-47dc-bc82-eae480d1b094' })
  id: string;

  @ApiProperty({ example: 'Proses' })
  status: OrderStatus;

  @ApiProperty({ example: 16 })
  size: number;

  @ApiProperty({ nullable: true, example: null })
  layer?: number;

  @ApiProperty({ example: true })
  isUseTopper: boolean;

  @ApiProperty({ example: '1730952000000' })
  pickupTime: string;

  @ApiProperty({ example: 'Happy Birthday' })
  text: string;

  @ApiProperty({ example: 'Red' })
  textColor: string;

  @ApiProperty({ format: 'double', example: 20000 })
  price: number;

  @ApiProperty({ format: 'double', example: 20000 })
  downPayment: number;

  @ApiProperty({ format: 'double', example: 20000 })
  remainingPayment: number;

  @ApiProperty({ example: '6289898888' })
  telp: string;

  @ApiProperty({ nullable: true, example: null })
  notes?: string;

  @ApiProperty({ type: [OrderPictureResponseDto] })
  pictures: OrderPictureResponseDto[];

  @ApiProperty({ type: [OrderProgressResponseDto] })
  progresses: OrderProgressResponseDto[];
}
