export type OrderEntity = {
  id: string;
  userId: string;
  size: number;
  layer?: number;
  isUseTopper: boolean;
  pickupTime: bigint;
  price: number;
  downPayment: number;
  remainingPayment: number;
  telp: string;
  notes?: string;
  text: string;
  textColor: string;
};

export type EditOrderEntity = {
  size: number;
  layer?: number;
  isUseTopper: boolean;
  pickupTime: bigint;
  price: number;
  downPayment: number;
  remainingPayment: number;
  telp: string;
  notes?: string;
  text: string;
  textColor: string;
};
