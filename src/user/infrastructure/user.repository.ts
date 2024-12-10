import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { UserEntity } from '../domain/user.entity';
import { IUserRepository } from '../domain/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private db: PrismaService) {}

  async add(data: UserEntity): Promise<string> {
    const { id } = await this.db.user.create({ data });

    return id;
  }

  async getAll(): Promise<UserEntity[]> {
    return await this.db.user.findMany({ where: { deletedAt: null } });
  }

  async getById(id: string): Promise<UserEntity> {
    const data = await this.db.user.findUnique({
      where: { id, deletedAt: null },
    });
    if (!data) {
      throw new NotFoundException('user not found');
    }

    return data;
  }

  async getByUsername(username: string): Promise<UserEntity> {
    const data = await this.db.user.findUnique({
      where: { username },
    });
    if (!data) {
      throw new NotFoundException('user not found');
    }

    return data;
  }

  async changeEmail(id: string, email: string): Promise<void> {
    await this.db.user.update({ where: { id }, data: { email } });
  }

  async changeUsername(id: string, username: string): Promise<void> {
    await this.db.user.update({ where: { id }, data: { username } });
  }

  async changePassword(id: string, password: string): Promise<void> {
    await this.db.user.update({ where: { id }, data: { password } });
  }

  async deleteById(id: string): Promise<void> {
    try {
      await this.db.user.update({
        where: { id: id },
        data: { deletedAt: new Date() },
      });
    } catch {
      throw new InternalServerErrorException('failed delete user');
    }
  }

  async verify(id: string): Promise<void> {
    const result = await this.db.user.count({
      where: { id, deletedAt: null },
    });
    if (!result) {
      throw new NotFoundException('user not found');
    }
  }
}
