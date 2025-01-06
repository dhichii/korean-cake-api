import { ApiProperty } from '@nestjs/swagger';
import { ProcessEntity } from 'src/process/domain/process.entity';
import { v4 as uuid } from 'uuid';

export class AddProcessDto {
  @ApiProperty({ example: 'example' })
  name: string;

  @ApiProperty({ example: 1 })
  step: number;
}

export class EditProcessDto {
  @ApiProperty({ example: 'example' })
  name: string;

  @ApiProperty({ example: 1 })
  step: number;
}

export class EditProcessStepDto {
  @ApiProperty({ example: 'e6314752-c753-47dc-bc82-eae480d1b094' })
  id: string;

  @ApiProperty({ example: 1 })
  step: number;
}

export function mapAddProcessDto(req: AddProcessDto): ProcessEntity {
  return {
    id: uuid(),
    name: req.name,
    step: req.step,
  };
}
