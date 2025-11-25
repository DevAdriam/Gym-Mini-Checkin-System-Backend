import { Injectable } from '@nestjs/common';
import { Admin } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { AdminRepositoryInterface } from './admin.repository.interface';

@Injectable()
export class AdminRepository implements AdminRepositoryInterface {
  constructor(private readonly databaseService: PrismaService) {}

  async findById(id: string): Promise<Admin | null> {
    return await this.databaseService.admin.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return await this.databaseService.admin.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async update(id: string, data: Partial<Admin>): Promise<Admin | null> {
    return await this.databaseService.admin.update({
      where: { id },
      data,
    });
  }

  async updatePassword(
    id: string,
    hashedPassword: string,
  ): Promise<Admin | null> {
    return await this.databaseService.admin.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async updateLastLogin(id: string): Promise<Admin | null> {
    return await this.databaseService.admin.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}
