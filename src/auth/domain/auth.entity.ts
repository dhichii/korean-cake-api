export type AuthEntity = {
  token: string;
  expiresAt: Date;
  revoked: boolean;
};
