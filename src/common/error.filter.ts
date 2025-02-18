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
    switch (true) {
      case exception instanceof HttpException:
        const { message } = exception.getResponse() as HttpException;
        return response.status(exception.getStatus()).json({ message });
      case exception instanceof ZodError:
        return response.status(400).json({
          message: 'Validation Error',
          errors: JSON.parse(exception.message).map((error) => ({
            code: error.message,
            expected: error.expected,
            received: error.received,
            path: error.path
              .map((p) => (typeof p === 'number' ? `[${p}]` : `.${p}`))
              .join('')
              .slice(1),
            message: error.message,
          })),
        });
      case exception instanceof Prisma.PrismaClientKnownRequestError:
        if (exception.code === 'P2002') {
          const target = exception.meta?.target as string[];
          return response.status(400).json({
            message: 'Bad Request',
            errors: target.map((v) => ({
              path: v,
              message: `${v} is already exist`,
            })),
          });
        } else {
          return response
            .status(500)
            .json({ message: 'Internal Server Error' });
        }
      default:
        return response.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
