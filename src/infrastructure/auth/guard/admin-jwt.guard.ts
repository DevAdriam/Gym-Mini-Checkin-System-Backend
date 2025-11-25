import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from 'src/application/admin/admin.service';
import { UnauthorizedException } from 'src/core/exceptions/http/unauthorized.exception';

@Injectable()
export class AdminJWTAuthGuard implements CanActivate {
  constructor(private readonly adminService: AdminService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { authorization }: Request['headers'] = request.headers;

    if (!authorization) {
      throw new UnauthorizedException({
        message: 'authorization header is needed',
      });
    }

    const authToken = authorization.replaceAll(/bearer/gim, '').trim();
    const payload = await this.adminService.verifyToken(authToken);

    if (!payload) {
      throw new UnauthorizedException({
        message: 'invalid token',
      });
    }

    if (payload.role !== 'admin') {
      throw new UnauthorizedException({
        message: 'Invalid token for admin access',
      });
    }

    request.user = payload;
    return true;
  }
}
