export type OrderEntity = {
  id: string;
  userId: string;
  size: number;
  layer?: number;
  isUseTopper: boolean;
  pickupTime: number;
  price: number;
  downPayment: number;
  remainingPayment: number;
  telp: string;
  notes?: string;
  text: string;
  textColor: string;
};
