import { AuthEntity } from './auth.entity';

export interface IAuthRepository {
  add(token: string, expiresAt: Date): Promise<void>;
  get(token: string): Promise<AuthEntity>;
  revoke(token: string): Promise<void>;
}
