import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAdminAuth } from '../types/type';

export const Admin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAdminAuth => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
