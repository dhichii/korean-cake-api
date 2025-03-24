import { NUMBER_REGEX } from '../../utils/regex';
import { z, ZodType } from 'zod';

export class OrderValidation {
  static readonly ADD: ZodType = z
    .object({
      pictures: z.array(z.any()).max(3).nonempty(),
      size: z.number().int().min(10),
      layer: z.number().int().positive().optional().nullable(),
      isUseTopper: z.boolean(),
      pickupTime: z.preprocess(
        (v: string) => (isNaN(parseInt(v)) ? v : BigInt(v)),
        z.bigint().positive(),
      ),
      text: z.string().max(255),
      textColor: z.string().max(120),
      price: z.number().min(0),
      downPayment: z.number().min(0),
      telp: z.string().regex(NUMBER_REGEX, 'should contains only number'),
      notes: z.string().optional().nullable(),
      progresses: z.array(z.string().uuid()).nonempty(),
    })
    .refine((schema) => schema.downPayment <= schema.price, {
      path: ['downPayment'],
      message: 'must be less than or equal to price',
    });

  static readonly GET_BY_ID: ZodType = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  });

  static readonly EDIT_BY_ID: ZodType = z
    .object({
      size: z.number().int().min(10),
      layer: z.number().int().positive().optional().nullable(),
      isUseTopper: z.boolean(),
      pickupTime: z.preprocess(
        (v: string) => (isNaN(parseInt(v)) ? v : BigInt(v)),
        z.bigint().positive(),
      ),
      text: z.string().max(255),
      textColor: z.string().max(120),
      price: z.number().min(0),
      downPayment: z.number().min(0),
      telp: z.string().regex(NUMBER_REGEX, 'should contains only number'),
      notes: z.string().optional().nullable(),
      deletedPictures: z.array(z.string().min(5)),
      addedProgresses: z.array(z.string().uuid()),
      deletedProgresses: z.array(z.string().uuid()),
      addedPictures: z.array(z.any()).max(3),
    })
    .refine((schema) => schema.downPayment <= schema.price, {
      path: ['downPayment'],
      message: 'must be less than or equal to price',
    });

  static readonly DELETE_BY_ID: ZodType = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  });

  static readonly EDIT_PROGRESS_BY_ID: ZodType = z.object({
    isFinish: z.boolean(),
  });
}
