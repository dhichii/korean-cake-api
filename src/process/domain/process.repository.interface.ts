import { ProcessEntity } from './process.entity';

export interface IProcessRepository {
  add(data: ProcessEntity): Promise<{ id: string }>;
  getAll(): Promise<ProcessEntity[]>;
  editById(id: string, data: ProcessEntity): Promise<void>;
  editStepById(id: string, step: number): Promise<void>;
  deleteById(id: string): Promise<void>;
  verify(id: string): Promise<void>;
  verifyAll(ids: string[]): Promise<void>;
}
