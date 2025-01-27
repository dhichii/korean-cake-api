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
  add(userId: string, req: AddProcessDto): Promise<AddProcessResponseDto>;
  getAll(userId: string): Promise<GetAllProcessResponseDto[]>;
  editById(id: string, userId: string, req: EditProcessDto): Promise<void>;
  editSteps(userId: string, req: EditProcessStepDto[]): Promise<void>;
  deleteById(id: string, userId: string): Promise<void>;
  verifyAll(ids: string[], userId: string): Promise<void>;
}
