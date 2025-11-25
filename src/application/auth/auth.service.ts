import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Env } from 'src/infrastructure/config/env.config';

// Note: AuthService methods for User authentication removed as User model no longer exists
// Admin authentication is now handled in AdminService
// Member registration will be handled in MemberService (to be created)

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env>,
  ) {}

  verifyToken(token: string): Promise<Record<string, unknown>> {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
    });
  }
}
