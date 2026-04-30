import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    // Map common Prisma errors to nicer HTTP responses
    const code = exception.code;
    const status =
      code === 'P2002'
        ? HttpStatus.CONFLICT
        : code === 'P2025'
          ? HttpStatus.NOT_FOUND
          : HttpStatus.BAD_REQUEST;

    res.status(status).json({
      statusCode: status,
      error: 'PrismaError',
      code,
      message: exception.message,
      meta: exception.meta ?? null,
    });
  }
}

