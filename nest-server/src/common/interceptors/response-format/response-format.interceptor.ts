import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

export type ResponseFormat<T> = {
  status: boolean;
  statusCode: number;
  path: string;
  message: string;
  data: T;
  timestamp: string;
};

@Injectable()
export class ResponseFormatInterceptor<T> implements NestInterceptor<
  T,
  ResponseFormat<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context)),
    );
  }

  private responseHandler(res: unknown, context: ExecutionContext): ResponseFormat<T> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = response.statusCode;

    return {
      status: true,
      statusCode,
      path: request.url,
      message: 'success',
      data: res as T,
      timestamp: new Date().toISOString(),
    };
  }
}

