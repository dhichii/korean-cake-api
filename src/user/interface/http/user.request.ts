import { Bcrypt } from '../../../utils/Bcrypt';
import { v4 as uuid } from 'uuid';
import { UserEntity } from '../../domain/user.entity';
import { Role } from '@prisma/client';

export type AddUserReq = {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: Role;
};

export async function mapAddUserReq(req: AddUserReq): Promise<UserEntity> {
  const password = await new Bcrypt().hash(req.password);

  return {
    id: uuid(),
    name: req.name,
    username: req.username,
    email: req.email,
    password: password,
    role: !req.role ? Role.USER : req.role,
  };
}
