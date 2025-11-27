import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../database/prisma.module';
import { MembershipExpirationScheduler } from './membership-expiration.scheduler';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  providers: [MembershipExpirationScheduler],
})
export class SchedulerModule {}
