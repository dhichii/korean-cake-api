import { BadRequestException } from '@nestjs/common';

export class JsonUtil {
  static parse<T>(data: string, errorMessage = 'Invalid JSON format'): T {
    try {
      return JSON.parse(data) as T;
    } catch {
      throw new BadRequestException(errorMessage);
    }
  }
}
