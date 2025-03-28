import { Role } from '@prisma/client';
import { USERNAME_REGEX } from '../../utils/regex';
import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly ADD: ZodType = z.object({
    name: z.string().min(1),
    username: z
      .string()
      .min(3)
      .regex(USERNAME_REGEX, 'username can only be letters and numbers.'),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum([Role.ADMIN, Role.USER]).optional(),
  });

  static readonly GET_BY_ID: ZodType = z.string().uuid();

  static readonly GET_BY_USERNAME: ZodType = z
    .string()
    .min(3)
    .regex(USERNAME_REGEX, 'username can only be letters and numbers.');

  static readonly EDIT_PROFILE_BY_ID: ZodType = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
  });

  static readonly DELETE_BY_ID: ZodType = z.string().uuid();

  static readonly CHANGE_EMAIL: ZodType = z.object({
    id: z.string().uuid(),
    password: z.string().min(8),
    email: z.string().email(),
  });

  static readonly CHANGE_USERNAME: ZodType = z.object({
    id: z.string().uuid(),
    password: z.string().min(8),
    username: z
      .string()
      .min(3)
      .regex(USERNAME_REGEX, 'username can only be letters and numbers.'),
  });

  static readonly CHANGE_PASSWORD: ZodType = z.object({
    id: z.string().uuid(),
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
  });
}
