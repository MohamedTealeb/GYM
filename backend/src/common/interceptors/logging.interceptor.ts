import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, ip } = request;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          this.logger.log(
            JSON.stringify({
              event: 'request',
              method,
              path: originalUrl,
              statusCode: response.statusCode,
              durationMs: Date.now() - startedAt,
              ip,
            }),
          );
        },
        error: (error: Error) => {
          this.logger.error(
            JSON.stringify({
              event: 'request_error',
              method,
              path: originalUrl,
              durationMs: Date.now() - startedAt,
              ip,
              errorName: error.name,
              errorMessage: error.message,
            }),
            error.stack,
          );
        },
      }),
    );
  }
}
