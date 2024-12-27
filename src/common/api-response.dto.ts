import { ApiProperty } from '@nestjs/swagger';

export class StatusResponseDto {
  @ApiProperty({ description: 'Status of the response', example: 'success' })
  status: string = 'success';
}

export class ValidationErrorResponse {
  @ApiProperty({
    example: [
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['username'],
        message: 'Required',
      },
    ],
  })
  errors;
}

export class BadRequestResponse {
  @ApiProperty({
    example: [
      {
        path: ['username'],
        message: 'username is already exist',
      },
    ],
  })
  errors;
}

export class UnauthorizedResponse {
  @ApiProperty({ example: [{ message: 'Unauthorized' }] })
  errors;
}

export class InvalidCredentialResponse {
  @ApiProperty({ example: [{ message: 'username or password incorrect' }] })
  errors;
}

export class InternalServerResponse {
  @ApiProperty({ example: [{ message: 'Internal Server Error' }] })
  errors;
}
