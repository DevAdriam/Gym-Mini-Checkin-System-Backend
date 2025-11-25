import { Injectable } from '@nestjs/common';
import { MEMBER_STATUS } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { MemberRepositoryInterface } from './member.repository.interface';

@Injectable()
export class MemberRepository implements MemberRepositoryInterface {
  constructor(private readonly databaseService: PrismaService) {}

  async findById(id: string, includeDeleted = false): Promise<any | null> {
    const where: any = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return await this.databaseService.member.findFirst({
      where,
      include: {
        membershipPackage: true,
        paymentScreenshots: true,
      },
    });
  }

  async findByMemberId(memberId: string): Promise<any | null> {
    return await this.databaseService.member.findFirst({
      where: {
        memberId,
        deletedAt: null,
      },
      include: {
        membershipPackage: true,
        paymentScreenshots: true,
      },
    });
  }

  async findByEmail(email: string): Promise<any | null> {
    return await this.databaseService.member.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findByPhone(phone: string): Promise<any | null> {
    return await this.databaseService.member.findFirst({
      where: {
        phone,
        deletedAt: null,
      },
    });
  }

  async create(data: any): Promise<any | null> {
    return await this.databaseService.member.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        profilePhoto: data.profilePhoto,
        memberId: data.memberId,
        status: data.status || 'PENDING',
        membershipPackageId: data.membershipPackageId,
        paymentScreenshots: data.paymentScreenshots
          ? {
              create: data.paymentScreenshots.map((screenshot: any) => ({
                imageUrl: screenshot.imageUrl,
                description: screenshot.description,
              })),
            }
          : undefined,
      },
      include: {
        membershipPackage: true,
        paymentScreenshots: true,
      },
    });
  }

  async update(id: string, data: any): Promise<any | null> {
    return await this.databaseService.member.update({
      where: { id },
      data,
      include: {
        membershipPackage: true,
        paymentScreenshots: true,
      },
    });
  }

  async updateStatus(id: string, status: MEMBER_STATUS): Promise<any | null> {
    return await this.databaseService.member.update({
      where: { id },
      data: { status },
      include: {
        membershipPackage: true,
        paymentScreenshots: true,
      },
    });
  }

  async findAll(
    filters: {
      status?: string;
      active?: string;
      search?: string;
    },
    page: number,
    limit: number,
  ): Promise<{ members: any[]; total: number }> {
    const where: any = {
      deletedAt: null,
    };

    // Filter by status
    if (filters.status) {
      where.status = filters.status;
    }

    // Filter by active/expired (based on endDate)
    if (filters.active) {
      const now = new Date();
      if (filters.active === 'ACTIVE') {
        where.endDate = {
          gte: now,
        };
        where.status = 'APPROVED';
      } else if (filters.active === 'EXPIRED') {
        where.endDate = {
          lt: now,
        };
        where.status = 'APPROVED';
      }
    }

    // Search filter
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { memberId: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [members, total] = await Promise.all([
      this.databaseService.member.findMany({
        where,
        include: {
          membershipPackage: true,
          paymentScreenshots: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.databaseService.member.count({ where }),
    ]);

    return { members, total };
  }

  async softDelete(id: string): Promise<any | null> {
    return await this.databaseService.member.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: {
        membershipPackage: true,
        paymentScreenshots: true,
      },
    });
  }

  async restore(id: string): Promise<any | null> {
    return await this.databaseService.member.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        membershipPackage: true,
        paymentScreenshots: true,
      },
    });
  }
}
