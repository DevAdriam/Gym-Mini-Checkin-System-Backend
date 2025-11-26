import { Module } from '@nestjs/common';
import { CheckInRepository } from 'src/domain/checkin/checkin.repository';
import { MemberRepository } from 'src/domain/member/member.repository';
import { CheckInService } from './checkin.service';

@Module({
  providers: [CheckInService, CheckInRepository, MemberRepository],
  exports: [CheckInService, CheckInRepository],
})
export class CheckInModule {}
