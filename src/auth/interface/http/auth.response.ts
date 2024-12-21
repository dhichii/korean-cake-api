import { Role } from '@prisma/client';

export type TokenResponse = {
  access: string;
  refresh: string;
  exp: number;
};

export type JWTSignPayload = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
};
