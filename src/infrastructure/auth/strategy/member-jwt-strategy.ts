import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UnauthorizedException } from 'src/core/exceptions/http/unauthorized.exception';
import { MemberRepository } from 'src/domain/member/member.repository';
import { Env } from 'src/infrastructure/config/env.config';

@Injectable()
export class MemberJWTStrategy extends PassportStrategy(
  Strategy,
  'member-jwt',
) {
  private readonly logger = new Logger(MemberJWTStrategy.name);
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly configService: ConfigService<Env>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
    });
    this.logger.log('MemberJWTStrategy initialized');
  }

  async validate(payload: { id: string; memberId?: string; role?: string }) {
    // For members, we can use either id or memberId
    let member;

    if (payload.memberId) {
      member = await this.memberRepository.findByMemberId(payload.memberId);
    } else if (payload.id) {
      member = await this.memberRepository.findById(payload.id);
    }

    if (!member) {
      throw new UnauthorizedException({
        message: 'Member not found',
      });
    }

    // Check if member is not deleted
    if (member.deletedAt) {
      throw new UnauthorizedException({
        message: 'Member account is deleted',
      });
    }

    return {
      id: member.id,
      memberId: member.memberId,
      role: 'member',
    };
  }
}
