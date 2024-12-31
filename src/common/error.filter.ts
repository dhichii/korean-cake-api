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
        return response.status(exception.getStatus()).json({
          errors: [{ message }],
        });
      case exception instanceof ZodError:
        return response.status(400).json({
          errors: JSON.parse(exception.message),
        });
      case exception instanceof Prisma.PrismaClientKnownRequestError:
        if (exception.code === 'P2002') {
          return response.status(400).json({
            errors: [
              {
                path: [exception.meta?.target],
                message: `${exception.meta?.target} is already exist`,
              },
            ],
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
