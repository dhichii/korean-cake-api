import { CreateAdminDto } from '../interface/http/admin.request';
import {
  CreateAdminResponseDto,
  GetAllAdminResponseDto,
} from '../interface/http/admin.response';

export interface IAdminService {
  add(req: CreateAdminDto): Promise<CreateAdminResponseDto>;
  getAll(): Promise<GetAllAdminResponseDto[]>;
  delete(id: string): Promise<void>;
}
