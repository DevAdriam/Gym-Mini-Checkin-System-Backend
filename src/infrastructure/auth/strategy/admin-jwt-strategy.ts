import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UnauthorizedException } from 'src/core/exceptions/http/unauthorized.exception';
import { AdminRepository } from 'src/domain/admin/admin.repository';
import { Env } from 'src/infrastructure/config/env.config';

@Injectable()
export class AdminJWTStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  private readonly logger = new Logger(AdminJWTStrategy.name);
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly configService: ConfigService<Env>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
    });
    this.logger.log('AdminJWTStrategy initialized');
  }

  async validate(payload: { id: string; role?: string }) {
    if (payload.role !== 'admin') {
      throw new UnauthorizedException({
        message: 'Invalid token for admin access',
      });
    }

    const foundAdmin = await this.adminRepository.findById(payload.id);
    if (!foundAdmin) {
      throw new UnauthorizedException({
        message: 'Admin not found',
      });
    }

    if (foundAdmin.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        message: 'Admin account is not active',
      });
    }

    return {
      id: payload.id,
      role: 'admin',
    };
  }
}
