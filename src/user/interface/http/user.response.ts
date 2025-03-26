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

export class UserFullResponseDto {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  password: string;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}
