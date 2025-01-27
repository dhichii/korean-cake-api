import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class OptionalParseIntPipe implements PipeTransform {
  constructor(private defaultValue?: number) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, _metadata: ArgumentMetadata): number | undefined {
    if (value === undefined || value === null || value === '') {
      return this.defaultValue;
    }

    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(
        'Invalid number provided. Please use a valid integer.',
      );
    }

    return val;
  }
}
