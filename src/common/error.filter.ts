import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

@Catch(ZodError, Prisma.PrismaClientKnownRequestError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    switch (exception.constructor) {
      case HttpException:
        return response.status(exception.getStatus()).json({
          errors: [{ message: exception.getResponse() }],
        });
      case ZodError:
        return response.status(400).json({
          errors: JSON.parse(exception.message),
        });
      case Prisma.PrismaClientKnownRequestError:
        if (exception.code === 'P2002') {
          return response.status(400).json({
            errors: [{ message: `${exception.meta?.target} is already exist` }],
          });
        } else {
          return response.status(500).json({
            errors: [{ message: 'Internal Server Error' }],
          });
        }
      default:
        return response.status(500).json({
          errors: [{ message: 'Internal Server Error' }],
        });
    }
  }
}
