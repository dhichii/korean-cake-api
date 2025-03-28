import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ProcessEntity } from '../domain/process.entity';
import { IProcessRepository } from '../domain/process.repository.interface';
import { EditProcessDto } from '../interface/http/process.request';
import {
  AddProcessResponseDto,
  GetAllProcessResponseDto,
} from '../interface/http/process.response';

@Injectable()
export class ProcessRepository implements IProcessRepository {
  constructor(private db: PrismaService) {}

  async add(data: ProcessEntity): Promise<AddProcessResponseDto> {
    const { id } = await this.db.process.create({ data });

    return { id };
  }

  async getAll(userId: string): Promise<GetAllProcessResponseDto[]> {
    return await this.db.process.findMany({
      select: {
        id: true,
        name: true,
        step: true,
      },
      where: { userId },
      orderBy: { step: 'asc' },
    });
  }

  async editById(id: string, data: EditProcessDto): Promise<void> {
    await this.db.process.update({ where: { id }, data });
  }

  async editStepById(id: string, step: number): Promise<void> {
    await this.db.process.update({ where: { id }, data: { step } });
  }

  async deleteById(id: string): Promise<void> {
    await this.db.process.delete({ where: { id } });
  }

  async verify(id: string, userId: string): Promise<void> {
    const result = await this.db.process.count({
      where: { id, userId },
    });
    if (!result) {
      throw new NotFoundException('process not found');
    }
  }

  async verifyAll(ids: string[], userId: string): Promise<void> {
    const result = await this.db.process.count({
      where: { id: { in: ids }, userId },
    });

    if (result != ids.length) {
      throw new NotFoundException('some process are not found');
    }
  }
}
