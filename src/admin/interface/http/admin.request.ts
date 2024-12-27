import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ example: 'example' })
  name: string;

  @ApiProperty({ example: 'example' })
  username: string;

  @ApiProperty({ example: 'example@gmail.com' })
  email: string;
}
