import { ApiProperty } from '@nestjs/swagger';
import { JWTSignPayload } from './auth.response';

export class RegisterDto {
  @ApiProperty({ description: 'Status of the response', example: 'example' })
  name: string;

  @ApiProperty({ description: 'Status of the response', example: 'example' })
  username: string;

  @ApiProperty({
    description: 'Status of the response',
    example: 'example@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'Status of the response',
    example: 'verystrongpassword',
  })
  password: string;
}

export type RefreshReq = {
  refresh: string;
  payload: JWTSignPayload;
};
