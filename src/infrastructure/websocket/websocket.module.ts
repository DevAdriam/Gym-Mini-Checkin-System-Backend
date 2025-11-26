import { Module } from '@nestjs/common';
import { MemberGateway } from './member.gateway';

@Module({
  providers: [MemberGateway],
  exports: [MemberGateway],
})
export class WebSocketModule {}
