import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetUserToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.body.access_token;
  },
);
