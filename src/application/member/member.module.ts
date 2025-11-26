import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MemberRepository } from 'src/domain/member/member.repository';
import { MemberJWTStrategy } from 'src/infrastructure/auth/strategy/member-jwt-strategy';
import { WebSocketModule } from 'src/infrastructure/websocket/websocket.module';
import { MemberService } from './member.service';

@Module({
  imports: [
    JwtModule,
    PassportModule.register({ defaultStrategy: 'member-jwt' }),
    forwardRef(() => WebSocketModule),
  ],
  providers: [MemberService, MemberRepository, MemberJWTStrategy],
  exports: [MemberService, MemberRepository],
})
export class MemberModule {}
