import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { MemberService } from 'src/application/member/member.service';
import { UnauthorizedException } from 'src/core/exceptions/http/unauthorized.exception';

@Injectable()
export class MemberJWTAuthGuard implements CanActivate {
  constructor(private readonly memberService: MemberService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { authorization }: Request['headers'] = request.headers;

    if (!authorization) {
      throw new UnauthorizedException({
        message: 'authorization header is needed',
      });
    }

    const authToken = authorization.replaceAll(/bearer/gim, '').trim();
    const payload = await this.memberService.verifyToken(authToken);

    if (!payload) {
      throw new UnauthorizedException({
        message: 'invalid token',
      });
    }

    if (payload.role && payload.role !== 'member') {
      throw new UnauthorizedException({
        message: 'Invalid token for member access',
      });
    }

    request.user = payload;
    return true;
  }
}
