import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ImageRepositoryInterface } from './image.repository.interface';

@Injectable()
export class ImageRepository implements ImageRepositoryInterface {
  constructor(private readonly databaseService: PrismaService) {}

  async findByMemberId(memberId: string): Promise<any[]> {
    const member = await this.databaseService.member.findFirst({
      where: { id: memberId, deletedAt: null },
      include: {
        paymentScreenshots: true,
      },
    });

    if (!member) {
      return [];
    }

    // Combine profile photo and payment screenshots
    const images: any[] = [];

    if (member.profilePhoto) {
      images.push({
        id: `profile-${member.id}`,
        imageUrl: member.profilePhoto,
        type: 'PROFILE',
        description: 'Profile photo',
        memberId: member.id,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      });
    }

    // Add payment screenshots
    member.paymentScreenshots.forEach((screenshot) => {
      images.push({
        id: screenshot.id,
        imageUrl: screenshot.imageUrl,
        type: 'PAYMENT_SCREENSHOT',
        description: screenshot.description,
        memberId: screenshot.memberId,
        createdAt: screenshot.createdAt,
        updatedAt: screenshot.updatedAt,
      });
    });

    return images;
  }

  async findById(id: string): Promise<any | null> {
    // Check if it's a profile photo ID
    if (id.startsWith('profile-')) {
      const memberId = id.replace('profile-', '');
      const member = await this.databaseService.member.findFirst({
        where: { id: memberId, deletedAt: null },
      });

      if (!member || !member.profilePhoto) {
        return null;
      }

      return {
        id: `profile-${member.id}`,
        imageUrl: member.profilePhoto,
        type: 'PROFILE',
        description: 'Profile photo',
        memberId: member.id,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      };
    }

    // Otherwise, it's a payment screenshot
    return await this.databaseService.memberPaymentScreenshot.findUnique({
      where: { id },
      include: {
        member: true,
      },
    });
  }

  async create(memberId: string, data: any): Promise<any | null> {
    if (data.type === 'PROFILE') {
      // Update member profile photo
      const member = await this.databaseService.member.update({
        where: { id: memberId },
        data: { profilePhoto: data.imageUrl },
        include: {
          paymentScreenshots: true,
        },
      });

      return {
        id: `profile-${member.id}`,
        imageUrl: member.profilePhoto,
        type: 'PROFILE',
        description: data.description || 'Profile photo',
        memberId: member.id,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      };
    } else {
      // Create payment screenshot
      return await this.databaseService.memberPaymentScreenshot.create({
        data: {
          memberId,
          imageUrl: data.imageUrl,
          description: data.description,
        },
        include: {
          member: true,
        },
      });
    }
  }

  async update(id: string, data: any): Promise<any | null> {
    // Check if it's a profile photo
    if (id.startsWith('profile-')) {
      const memberId = id.replace('profile-', '');
      const updateData: any = {};

      if (data.imageUrl) {
        updateData.profilePhoto = data.imageUrl;
      }

      const member = await this.databaseService.member.update({
        where: { id: memberId },
        data: updateData,
      });

      return {
        id: `profile-${member.id}`,
        imageUrl: member.profilePhoto,
        type: 'PROFILE',
        description: data.description || 'Profile photo',
        memberId: member.id,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      };
    }

    // Update payment screenshot
    const updateData: any = {};
    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    return await this.databaseService.memberPaymentScreenshot.update({
      where: { id },
      data: updateData,
      include: {
        member: true,
      },
    });
  }

  async delete(id: string): Promise<boolean> {
    // Check if it's a profile photo
    if (id.startsWith('profile-')) {
      const memberId = id.replace('profile-', '');
      await this.databaseService.member.update({
        where: { id: memberId },
        data: { profilePhoto: null },
      });
      return true;
    }

    // Delete payment screenshot
    await this.databaseService.memberPaymentScreenshot.delete({
      where: { id },
    });
    return true;
  }
}
