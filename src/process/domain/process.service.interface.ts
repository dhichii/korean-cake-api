import {
  AddProcessDto,
  EditProcessDto,
  EditProcessStepDto,
} from '../interface/http/process.request';
import {
  AddProcessResponseDto,
  GetAllProcessResponseDto,
} from '../interface/http/process.response';

export interface IProcessService {
  add(req: AddProcessDto): Promise<AddProcessResponseDto>;
  getAll(): Promise<GetAllProcessResponseDto[]>;
  editById(id: string, req: EditProcessDto): Promise<void>;
  editSteps(req: EditProcessStepDto[]): Promise<void>;
  deleteById(id: string): Promise<void>;
}
