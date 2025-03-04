import { RefreshReq, RegisterDto } from '../interface/http/auth.request';
import { JWTSignPayload, TokenResponse } from '../interface/http/auth.response';
import { AuthEntity } from './auth.entity';

export interface IAuthService {
  register(req: RegisterDto): Promise<void>;
  login(payload: JWTSignPayload): Promise<TokenResponse>;
  logout(refreshToken: string): Promise<void>;
  refresh(req: RefreshReq): Promise<TokenResponse>;
  revokeAllByUserId(userId: string): Promise<void>;
  get(refreshToken: string): Promise<AuthEntity>;
}
