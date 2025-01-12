import { Inject, Injectable } from '@nestjs/common';
import { IProcessService } from '../domain/process.service.interface';
import { IProcessRepository } from '../domain/process.repository.interface';
import {
  AddProcessDto,
  EditProcessDto,
  EditProcessStepDto,
  mapAddProcessDto,
} from '../interface/http/process.request';
import {
  AddProcessResponseDto,
  GetAllProcessResponseDto,
} from '../interface/http/process.response';
import { ValidationService } from '../../common/validation.service';
import { ProcessValidation } from './process.validation';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ProcessService implements IProcessService {
  constructor(
    @Inject('IProcessRepository') private processRepository: IProcessRepository,
    private validationService: ValidationService,
    private prismaService: PrismaService,
  ) {}

  async add(
    userId: string,
    req: AddProcessDto,
  ): Promise<AddProcessResponseDto> {
    this.validationService.validate(ProcessValidation.ADD, req);

    return await this.processRepository.add(mapAddProcessDto(userId, req));
  }

  async getAll(userId: string): Promise<GetAllProcessResponseDto[]> {
    return await this.processRepository.getAll(userId);
  }

  async editById(
    id: string,
    userId: string,
    req: EditProcessDto,
  ): Promise<void> {
    this.validationService.validate(ProcessValidation.EDIT_BY_ID, {
      id,
      ...req,
    });

    await this.processRepository.verify(id, userId);

    const data = {
      name: req.name,
      step: req.step,
    };
    await this.processRepository.editById(id, data);
  }

  async editSteps(userId: string, req: EditProcessStepDto[]): Promise<void> {
    this.validationService.validate(ProcessValidation.EDIT_STEPS, req);

    const ids = [];
    const processes = [];
    for (const obj of req) {
      ids.push(obj.id);
      processes.push(this.processRepository.editStepById(obj.id, obj.step));
    }

    await this.processRepository.verifyAll(ids, userId);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.prismaService.$transaction(async (tx) => {
      await Promise.all(processes);
    });
  }

  async deleteById(id: string, userId: string): Promise<void> {
    this.validationService.validate(ProcessValidation.DELETE_BY_ID, id);

    await this.processRepository.verify(id, userId);
    await this.processRepository.deleteById(id);
  }

  async verifyAll(ids: string[], userId: string): Promise<void> {
    await this.processRepository.verifyAll(ids, userId);
  }
}
