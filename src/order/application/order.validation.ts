import { NUMBER_REGEX } from '../../utils/regex';
import { z, ZodType } from 'zod';

export class OrderValidation {
  static readonly ADD: ZodType = z.object({
    pictures: z.array(z.any()).nonempty(),
    size: z.preprocess((v: string) => parseInt(v), z.number().min(10)),
    layer: z.preprocess(
      (v: string) => parseInt(v) || null,
      z.number().nullable(),
    ),
    isUseTopper: z.preprocess((v: string) => v === 'true', z.boolean()),
    pickupTime: z.preprocess((v: string) => BigInt(v), z.bigint().positive()),
    text: z.string(),
    textColor: z.string(),
    price: z.preprocess((v: string) => parseFloat(v), z.number().min(0)),
    downPayment: z.preprocess((v: string) => parseFloat(v), z.number().min(0)),
    telp: z.string().regex(NUMBER_REGEX, 'should contains only number'),
    notes: z.string().optional(),
    progresses: z.preprocess(
      (v) => (typeof v === 'string' ? [v] : v),
      z.array(z.string().uuid()),
    ),
  });

  static readonly GET_BY_ID: ZodType = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  });

  static readonly EDIT_BY_ID: ZodType = z.object({
    size: z.preprocess((v: string) => parseInt(v), z.number().min(10)),
    layer: z.preprocess(
      (v: string) => parseInt(v) || null,
      z.number().nullable(),
    ),
    isUseTopper: z.preprocess((v: string) => v === 'true', z.boolean()),
    pickupTime: z.preprocess((v: string) => BigInt(v), z.bigint().positive()),
    text: z.string(),
    textColor: z.string(),
    price: z.preprocess((v: string) => parseFloat(v), z.number().min(0)),
    downPayment: z.preprocess((v: string) => parseFloat(v), z.number().min(0)),
    telp: z.string().regex(NUMBER_REGEX, 'should contains only number'),
    notes: z.string().optional(),
    deletedPictures: z.preprocess(
      (v) => {
        if (Array.isArray(v)) return v;
        if (typeof v === 'string') return [v];
        return [];
      },
      z.array(z.string().min(5).optional()),
    ),
    addedProgresses: z.preprocess((v) => {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') return [v];
      return [];
    }, z.array(z.string().uuid().optional())),
    deletedProgresses: z.preprocess((v) => {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') return [v];
      return [];
    }, z.array(z.string().uuid().optional())),
    addedPictures: z.array(z.any()).optional(),
  });

  static readonly DELETE_BY_ID: ZodType = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  });

  static readonly EDIT_PROGRESS_BY_ID: ZodType = z.object({
    isFinish: z.preprocess((v: string) => v === 'true', z.boolean()),
  });
}
