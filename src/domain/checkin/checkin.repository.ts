import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CheckInRepositoryInterface } from './checkin.repository.interface';

@Injectable()
export class CheckInRepository implements CheckInRepositoryInterface {
  constructor(private readonly databaseService: PrismaService) {}

  async findAll(
    filters: {
      memberId?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number,
    limit: number,
  ): Promise<{ checkIns: any[]; total: number }> {
    const where: any = {};

    if (filters.memberId) {
      where.memberId = filters.memberId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.checkInTime = {};
      if (filters.startDate) {
        where.checkInTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.checkInTime.lte = filters.endDate;
      }
    }

    const [checkIns, total] = await Promise.all([
      this.databaseService.checkInLog.findMany({
        where,
        include: {
          member: {
            include: {
              membershipPackage: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          checkInTime: 'desc',
        },
      }),
      this.databaseService.checkInLog.count({ where }),
    ]);

    return { checkIns, total };
  }

  async findByMemberId(
    memberId: string,
    filters: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number,
    limit: number,
  ): Promise<{ checkIns: any[]; total: number }> {
    const where: any = {
      memberId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.checkInTime = {};
      if (filters.startDate) {
        where.checkInTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.checkInTime.lte = filters.endDate;
      }
    }

    const [checkIns, total] = await Promise.all([
      this.databaseService.checkInLog.findMany({
        where,
        include: {
          member: {
            include: {
              membershipPackage: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          checkInTime: 'desc',
        },
      }),
      this.databaseService.checkInLog.count({ where }),
    ]);

    return { checkIns, total };
  }

  async create(data: any): Promise<any | null> {
    return await this.databaseService.checkInLog.create({
      data: {
        memberId: data.memberId,
        status: data.status,
        reason: data.reason,
        checkInTime: data.checkInTime || new Date(),
      },
      include: {
        member: {
          include: {
            membershipPackage: true,
          },
        },
      },
    });
  }
}
