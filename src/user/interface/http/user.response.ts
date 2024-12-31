import { Role } from '@prisma/client';

export class UserResponseDto {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export class UserWithPasswordResponseDto {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ChangeEmailResponseDto {
  access: string;
}

export class ChangeUsernameResponseDto {
  access: string;
}
