import { ProcessEntity } from 'src/process/domain/process.entity';
import { v4 as uuid } from 'uuid';

export class AddProcessDto {
  name: string;
  step: number;
}

export class EditProcessDto {
  name: string;
  step: number;
}

export class EditProcessStepDto {
  id: string;
  step: number;
}

export function mapAddProcessDto(req: AddProcessDto): ProcessEntity {
  return {
    id: uuid(),
    name: req.name,
    step: req.step,
  };
}
