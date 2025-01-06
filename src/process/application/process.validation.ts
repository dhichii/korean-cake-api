import { z, ZodType } from 'zod';

export class ProcessValidation {
  static readonly ADD: ZodType = z.object({
    name: z.string().min(1),
    step: z.number().min(1),
  });

  static readonly EDIT_BY_ID: ZodType = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    step: z.number().min(1),
  });

  static readonly EDIT_STEPS: ZodType = z.array(
    z.object({
      id: z.string().uuid(),
      step: z.number().min(1),
    }),
  );

  static readonly DELETE_BY_ID: ZodType = z.string().uuid();
}
