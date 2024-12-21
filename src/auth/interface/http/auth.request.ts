import { JWTSignPayload } from './auth.response';

export type RegisterReq = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export type RefreshReq = {
  refresh: string;
  payload: JWTSignPayload;
};
