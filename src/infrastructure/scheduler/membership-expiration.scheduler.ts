import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MembershipExpirationScheduler {
  private readonly logger = new Logger(MembershipExpirationScheduler.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Cron job to check and handle expired memberships
   * Runs daily at midnight (00:00:00)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/bangkok',
  })
  async handleExpiredMemberships() {
    this.logger.log('Starting membership expiration check...');

    try {
      const now = new Date();

      // Find all approved members with expired endDate
      const expiredMembers = await this.prismaService.member.findMany({
        where: {
          status: 'APPROVED',
          endDate: {
            lt: now, // endDate is less than current date
          },
          deletedAt: null, // Not soft-deleted
        },
        include: {
          membershipPackage: true,
        },
      });

      if (expiredMembers.length === 0) {
        this.logger.log('No expired memberships found.');
        return;
      }

      this.logger.log(`Found ${expiredMembers.length} expired membership(s)`);

      // Log expired members (you can extend this to send notifications, update status, etc.)
      for (const member of expiredMembers) {
        this.logger.warn(
          `Membership expired for member: ${member.memberId} (${member.name}) - Expired on: ${member.endDate?.toISOString()}`,
        );

        // Optional: You can add logic here to:
        // - Send expiration notification emails
        // - Update member status if needed
        // - Create expiration records
        // - Emit WebSocket events
      }

      this.logger.log(
        `Membership expiration check completed. Processed ${expiredMembers.length} expired membership(s).`,
      );
    } catch (error) {
      this.logger.error(
        'Error occurred while checking expired memberships:',
        error,
      );
    }
  }

  /**
   * Cron job to check memberships expiring soon (e.g., within 7 days)
   * Runs daily at 9:00 AM
   */
  @Cron('0 9 * * *') // Every day at 9:00 AM
  async handleExpiringSoonMemberships() {
    this.logger.log('Checking for memberships expiring soon...');

    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      // Find members whose membership will expire within 7 days
      const expiringSoonMembers = await this.prismaService.member.findMany({
        where: {
          status: 'APPROVED',
          endDate: {
            gte: now, // Not yet expired
            lte: sevenDaysFromNow, // Expires within 7 days
          },
          deletedAt: null,
        },
        include: {
          membershipPackage: true,
        },
      });

      if (expiringSoonMembers.length === 0) {
        this.logger.log('No memberships expiring soon found.');
        return;
      }

      this.logger.log(
        `Found ${expiringSoonMembers.length} membership(s) expiring within 7 days`,
      );

      // Log expiring soon members (you can extend this to send reminder emails)
      for (const member of expiringSoonMembers) {
        const daysUntilExpiration = Math.ceil(
          (new Date(member.endDate!).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        this.logger.warn(
          `Membership expiring soon for member: ${member.memberId} (${member.name}) - Expires in ${daysUntilExpiration} day(s) on ${member.endDate?.toISOString().split('T')[0]}`,
        );

        // Optional: Send reminder emails to members
      }

      this.logger.log(
        `Expiring soon check completed. Processed ${expiringSoonMembers.length} membership(s).`,
      );
    } catch (error) {
      this.logger.error(
        'Error occurred while checking expiring soon memberships:',
        error,
      );
    }
  }
}
