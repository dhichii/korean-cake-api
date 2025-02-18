import { USERNAME_REGEX } from '../../utils/regex';
import { z, ZodType } from 'zod';

export class AuthValidation {
  static readonly REGISTER: ZodType = z.object({
    name: z.string().min(1),
    username: z
      .string()
      .min(3)
      .regex(USERNAME_REGEX, 'username can only be letters and numbers.'),
    email: z.string().email(),
    password: z.string().min(8),
  });

  static readonly LOGIN: ZodType = z.object({
    username: z
      .string()
      .min(3)
      .regex(USERNAME_REGEX, 'username can only be letters and numbers.'),
    password: z.string().min(8),
  });

  static readonly REVOKE_ALL_BY_USER_ID = z.string().uuid();
}
