import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<{
      headers: Record<string, string | string[] | undefined>;
      request_id?: string;
    }>();
    const response = http.getResponse<{
      setHeader: (name: string, value: string) => void;
    }>();

    const headerValue = request.headers['x-request-id'];
    const requestId =
      (Array.isArray(headerValue) ? headerValue[0] : headerValue) ??
      `req_${randomUUID().replace(/-/g, '')}`;

    request.request_id = requestId;
    response.setHeader('x-request-id', requestId);

    return next.handle().pipe(
      tap(() => {
        response.setHeader('x-request-id', requestId);
      }),
    );
  }
}
