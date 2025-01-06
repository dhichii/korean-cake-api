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

  async add(req: AddProcessDto): Promise<AddProcessResponseDto> {
    this.validationService.validate(ProcessValidation.ADD, req);

    return await this.processRepository.add(mapAddProcessDto(req));
  }

  async getAll(): Promise<GetAllProcessResponseDto[]> {
    return await this.processRepository.getAll();
  }

  async editById(id: string, req: EditProcessDto): Promise<void> {
    this.validationService.validate(ProcessValidation.EDIT_BY_ID, {
      id,
      ...req,
    });

    await this.processRepository.verify(id);

    const data = {
      name: req.name,
      step: req.step,
    };
    await this.processRepository.editById(id, data);
  }

  async editSteps(req: EditProcessStepDto[]): Promise<void> {
    this.validationService.validate(ProcessValidation.EDIT_STEPS, req);

    const ids = [];
    const processes = [];
    for (const obj of req) {
      ids.push(obj.id);
      processes.push(this.processRepository.editStepById(obj.id, obj.step));
    }

    await this.processRepository.verifyAll(ids);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.prismaService.$transaction(async (tx) => {
      await Promise.all(processes);
    });
  }

  async deleteById(id: string): Promise<void> {
    this.validationService.validate(ProcessValidation.DELETE_BY_ID, id);

    await this.processRepository.verify(id);
    await this.processRepository.deleteById(id);
  }
}
