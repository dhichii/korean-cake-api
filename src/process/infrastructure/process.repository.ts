import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ProcessEntity } from '../domain/process.entity';
import { IProcessRepository } from '../domain/process.repository.interface';

@Injectable()
export class ProcessRepository implements IProcessRepository {
  constructor(private db: PrismaService) {}

  async add(data: ProcessEntity): Promise<{ id: string }> {
    const { id } = await this.db.process.create({ data });

    return { id };
  }

  async getAll(): Promise<ProcessEntity[]> {
    return await this.db.process.findMany({ orderBy: { step: 'asc' } });
  }

  async editById(id: string, data: ProcessEntity): Promise<void> {
    await this.db.process.update({ where: { id }, data });
  }

  async editStepById(id: string, step: number): Promise<void> {
    await this.db.process.update({ where: { id }, data: { step } });
  }

  async deleteById(id: string): Promise<void> {
    await this.db.process.delete({ where: { id } });
  }

  async verify(id: string): Promise<void> {
    const result = await this.db.user.count({
      where: { id, deletedAt: null },
    });
    if (!result) {
      throw new NotFoundException('process not found');
    }
  }

  async verifyAll(ids: string[]): Promise<void> {
    const result = await this.db.process.count({
      where: { id: { in: ids } },
    });

    if (result != ids.length) {
      throw new NotFoundException('some process are not found');
    }
  }
}
