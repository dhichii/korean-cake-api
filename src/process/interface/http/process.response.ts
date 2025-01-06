import { ApiProperty } from '@nestjs/swagger';

export class AddProcessResponseDto {
  @ApiProperty({ example: 'e6314752-c753-47dc-bc82-eae480d1b094' })
  id: string;
}

export class GetAllProcessResponseDto {
  @ApiProperty({ example: 'e6314752-c753-47dc-bc82-eae480d1b094' })
  id: string;

  @ApiProperty({ example: 'example' })
  name: string;

  @ApiProperty({ example: 1 })
  step: number;
}
