import { AuthEntity } from './auth.entity';

export interface IAuthRepository {
  add(userId: string, token: string, expiresAt: Date): Promise<void>;
  get(token: string): Promise<AuthEntity>;
  revoke(token: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
}
