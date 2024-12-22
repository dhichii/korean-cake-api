import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { IAuthRepository } from '../domain/auth.repository.interface';
import { AuthEntity } from '../domain/auth.entity';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private db: PrismaService) {}

  async add(token: string, expiresAt: Date): Promise<void> {
    await this.db.authentication.create({
      data: { token, expiresAt },
    });
  }

  async get(token: string): Promise<AuthEntity> {
    const data = await this.db.authentication.findUnique({
      where: { token, revoked: false },
    });
    if (!data) {
      throw new ForbiddenException('invalid or expired token');
    }

    return data;
  }

  async revoke(token: string): Promise<void> {
    await this.db.authentication.update({
      data: { revoked: true },
      where: { token },
    });
  }
}
