import { EditProcessDto } from '../interface/http/process.request';
import {
  AddProcessResponseDto,
  GetAllProcessResponseDto,
} from '../interface/http/process.response';
import { ProcessEntity } from './process.entity';

export interface IProcessRepository {
  add(data: ProcessEntity): Promise<AddProcessResponseDto>;
  getAll(userId: string): Promise<GetAllProcessResponseDto[]>;
  editById(id: string, data: EditProcessDto): Promise<void>;
  editStepById(id: string, step: number): Promise<void>;
  deleteById(id: string): Promise<void>;
  verify(id: string, userId: string): Promise<void>;
  verifyAll(ids: string[], userId: string): Promise<void>;
}
