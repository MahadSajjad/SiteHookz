import { Injectable, Inject, ExecutionContext, CallHandler, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => {
        // If the controller already returned an object with 'success: true', avoid wrapping it twice
        if (data && typeof data === 'object' && 'success' in data && data.success === true) {
          return data;
        }
        return {
          success: true,
          data,
        };
      })
    );
  }
}
