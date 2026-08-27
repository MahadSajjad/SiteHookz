import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserContext {
  userAccountId: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
