import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IMemberAuth } from '../types/type';

export const Member = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IMemberAuth => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
