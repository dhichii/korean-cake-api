import { NUMBER_REGEX } from '../../utils/regex';
import { z, ZodType } from 'zod';

export class OrderValidation {
  static readonly ADD: ZodType = z.object({
    size: z.number().min(10),
    layer: z.number().optional(),
    isUseTopper: z.boolean(),
    pickupTime: z.bigint().positive(),
    text: z.string(),
    textColor: z.string(),
    price: z.number().min(0),
    downPayment: z.number().min(0),
    remainingPayment: z.number().min(0),
    telp: z.string().regex(NUMBER_REGEX, 'should contains only number'),
    notes: z.string().optional(),
    progresses: z.array(z.string().uuid()),
  });

  static readonly GET_BY_ID: ZodType = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  });

  static readonly EDIT_BY_ID: ZodType = z.object({
    size: z.number().min(10),
    layer: z.number().optional(),
    isUseTopper: z.boolean(),
    pickupTime: z.bigint().positive(),
    text: z.string(),
    textColor: z.string(),
    price: z.number().min(0),
    downPayment: z.number().min(0),
    remainingPayment: z.number().min(0),
    telp: z.string().regex(NUMBER_REGEX, 'should contains only number'),
    notes: z.string().optional(),
    deletedPictures: z.array(z.string().min(5)),
    addedProgresses: z.array(z.string().uuid()),
    deletedProgresses: z.array(z.string().uuid()),
  });

  static readonly DELETE_BY_ID: ZodType = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  });

  static readonly EDIT_PROGRESS_BY_ID: ZodType = z.object({
    isFinish: z.string().uuid(),
  });
}
