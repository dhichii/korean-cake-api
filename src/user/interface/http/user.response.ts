import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: 'e6314752-c753-47dc-bc82-eae480d1b094' })
  id: string;

  @ApiProperty({ example: 'example' })
  name: string;

  @ApiProperty({ example: 'example' })
  username: string;

  @ApiProperty({ example: 'example@gmail.com' })
  email: string;

  @ApiProperty({ example: 'USER' })
  role: Role;

  @ApiProperty({ example: '2024-04-07T06:53:09.538Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-04-07T06:53:09.538Z' })
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
  @ApiProperty({
    description: 'The access token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  access: string;
}

export class ChangeUsernameResponseDto {
  @ApiProperty({
    description: 'The access token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  access: string;
}
