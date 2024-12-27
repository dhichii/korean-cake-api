import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminResponseDto {
  @ApiProperty({ example: 'e6314752-c753-47dc-bc82-eae480d1b094' })
  id: string;

  @ApiProperty({ example: '62XvPPJ4' })
  password: string;
}

export class GetAllAdminResponseDto {
  @ApiProperty({ example: 'e6314752-c753-47dc-bc82-eae480d1b094' })
  id: string;

  @ApiProperty({ example: 'example' })
  name: string;

  @ApiProperty({ example: 'example' })
  username: string;

  @ApiProperty({ example: 'example@gmail.com' })
  email: string;

  @ApiProperty({ example: '2024-04-07T06:53:09.538Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-04-07T06:53:09.538Z' })
  updatedAt: Date;
}
