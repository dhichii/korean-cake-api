import { Role } from '@prisma/client';

export type UserEntity = {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  tokenVersion?: number;
  createdAt?: Date;
  updatedAt?: Date;
};
