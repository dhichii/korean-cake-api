import { RefreshReq, RegisterReq } from '../interface/http/auth.request';
import { JWTSignPayload, TokenResponse } from '../interface/http/auth.response';

export interface IAuthService {
  register(req: RegisterReq): Promise<void>;
  login(payload: JWTSignPayload): Promise<TokenResponse>;
  logout(refreshToken: string): Promise<void>;
  refresh(req: RefreshReq): Promise<TokenResponse>;
}
