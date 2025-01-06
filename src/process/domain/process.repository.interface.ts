import { EditProcessDto } from '../interface/http/process.request';
import { AddProcessResponseDto } from '../interface/http/process.response';
import { ProcessEntity } from './process.entity';

export interface IProcessRepository {
  add(data: ProcessEntity): Promise<AddProcessResponseDto>;
  getAll(): Promise<ProcessEntity[]>;
  editById(id: string, data: EditProcessDto): Promise<void>;
  editStepById(id: string, step: number): Promise<void>;
  deleteById(id: string): Promise<void>;
  verify(id: string): Promise<void>;
  verifyAll(ids: string[]): Promise<void>;
}
