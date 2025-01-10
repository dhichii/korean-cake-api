import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Status of the response', example: 'success' })
  status: string = 'success';

  @ApiProperty({ description: 'The data returned in the response' })
  data: T;

  constructor(data: T) {
    this.data = data;
  }
}

export class StatusResponseDto {
  @ApiProperty({ description: 'Status of the response', example: 'success' })
  status: string = 'success';
}

export type PaginationPayload<T> = {
  limit: number;
  page: number;
  totalResult: number;
  data: T;
};

export class PaginationResponseDto<T> {
  @ApiProperty({ description: 'Status of the response', example: 'success' })
  readonly status: string = 'success';

  @ApiProperty({ description: 'Limit of data showed per page', example: 5 })
  readonly limit: number;

  @ApiProperty({ description: 'Total of page', example: 2 })
  readonly totalPage: number;

  @ApiProperty({ description: 'Total of the data', example: 9 })
  readonly totalResult: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  readonly page: number;

  @ApiProperty({ description: 'The data returned in the response' })
  readonly data: T;

  constructor(payload: PaginationPayload<T>) {
    const { limit, page, totalResult, data } = payload;
    this.limit = limit;
    this.page = page;
    this.totalPage = this.countTotalPage(totalResult, limit);
    this.totalResult = totalResult;
    this.data = data;
  }

  private countTotalPage(totalResult: number, limit: number) {
    let total = Math.floor(totalResult / limit);
    if (totalResult % limit > 0) {
      total++;
    }

    return total;
  }
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

export class ForbiddenResponse {
  @ApiProperty({ example: [{ message: 'Forbidden resource' }] })
  errors;
}

export class InternalServerResponse {
  @ApiProperty({ example: [{ message: 'Internal Server Error' }] })
  errors;
}
