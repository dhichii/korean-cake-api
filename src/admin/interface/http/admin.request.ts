import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { generateRandomPassword } from 'src/utils/password';

export class CreateAdminDto {
  @ApiProperty({ example: 'example' })
  name: string;

  @ApiProperty({ example: 'example' })
  username: string;

  @ApiProperty({ example: 'example@gmail.com' })
  email: string;
}

export function mapCreateAdminDto(data: CreateAdminDto) {
  return {
    name: data.name,
    username: data.username,
    email: data.email,
    password: generateRandomPassword(),
    role: Role.ADMIN,
  };
}
