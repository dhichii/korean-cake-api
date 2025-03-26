import { ApiProperty } from '@nestjs/swagger';
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
  tokenVersion: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export class LoginResponseDto {
  @ApiProperty({
    description: 'The access token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  access: string;
}

export class RefreshResponseDto {
  @ApiProperty({
    description: 'The access token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  access: string;
}
