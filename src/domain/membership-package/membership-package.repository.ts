import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { MembershipPackageRepositoryInterface } from './membership-package.repository.interface';

@Injectable()
export class MembershipPackageRepository
  implements MembershipPackageRepositoryInterface
{
  constructor(private readonly databaseService: PrismaService) {}

  async findById(id: string, includeDeleted = false): Promise<any | null> {
    const where: any = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return await this.databaseService.membershipPackage.findFirst({
      where,
      include: {
        members: {
          where: {
            deletedAt: null,
          },
          take: 5, // Limit members in response
        },
      },
    });
  }

  async findAll(filters: { isActive?: boolean }): Promise<any[]> {
    const where: any = {
      deletedAt: null,
    };

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return await this.databaseService.membershipPackage.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async create(data: any): Promise<any | null> {
    return await this.databaseService.membershipPackage.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        durationDays: data.durationDays,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive === undefined ? true : data.isActive,
      },
    });
  }

  async update(id: string, data: any): Promise<any | null> {
    // Explicitly exclude isActive - it should only be updated via updateStatus method
    const updateData: any = {};
    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.price !== undefined) {
      updateData.price = data.price;
    }
    if (data.durationDays !== undefined) {
      updateData.durationDays = data.durationDays;
    }
    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder;
    }

    return await this.databaseService.membershipPackage.update({
      where: { id },
      data: updateData,
    });
  }

  async updateStatus(id: string, isActive: boolean): Promise<any | null> {
    return await this.databaseService.membershipPackage.update({
      where: { id },
      data: { isActive },
    });
  }

  async softDelete(id: string): Promise<any | null> {
    return await this.databaseService.membershipPackage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<any | null> {
    return await this.databaseService.membershipPackage.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
