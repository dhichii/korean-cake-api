import { Bcrypt } from '../../../utils/Bcrypt';
import { v4 as uuid } from 'uuid';
import { UserEntity } from '../../domain/user.entity';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AddUserDto {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: Role;
}

export async function mapAddUserDto(
  req: AddUserDto,
): Promise<Omit<UserEntity, 'tokenVersion'>> {
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

export class EditUserProfileDto {
  @ApiProperty({ example: 'example' })
  name: string;
}

export class ChangeEmailDto {
  @ApiProperty({ example: 'verystrongpassword' })
  password: string;

  @ApiProperty({ example: 'example' })
  email: string;
}

export class ChangeUsernameDto {
  @ApiProperty({ example: 'verystrongpassword' })
  password: string;

  @ApiProperty({ example: 'example' })
  username: string;
}

export class ChangeUserPasswordDto {
  @ApiProperty({ example: 'verystrongpassword' })
  oldPassword: string;

  @ApiProperty({ example: 'newstrongpassword' })
  newPassword: string;
}
