import { Role } from '@prisma/client';

export type UserResponse = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

export type UserWithPasswordResponse = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};
