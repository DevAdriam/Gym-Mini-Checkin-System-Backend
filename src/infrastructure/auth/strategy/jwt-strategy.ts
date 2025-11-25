import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTPayload } from 'src/common/types/type';
import { Env } from 'src/infrastructure/config/env.config';

// Note: JWTStrategy for User authentication removed as User model no longer exists
// Admin authentication uses AdminJWTStrategy
// Member authentication will use a different strategy (to be created)

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JWTStrategy.name);
  constructor(private readonly configService: ConfigService<Env>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
    });
    this.logger.log(
      'JWTStrategy initialized (deprecated - User model removed)',
    );
  }

  async validate(payload: JWTPayload) {
    // User model removed - this strategy is deprecated
    // Use AdminJWTStrategy for admin authentication
    return {
      id: payload.id,
    };
  }
}
