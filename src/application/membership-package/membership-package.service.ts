import { Injectable } from '@nestjs/common';
import { BadRequestException } from 'src/core/exceptions/http/bad-request.exception';
import { NotFoundException } from 'src/core/exceptions/http/not-found.exception';
import { MembershipPackageRepository } from 'src/domain/membership-package/membership-package.repository';
import { CreateMembershipPackageDto } from './dto/create-membership-package.dto';
import { MembershipPackageFilterDto } from './dto/membership-package-filter.dto';
import { UpdateMembershipPackageDto } from './dto/update-membership-package.dto';
import { UpdatePackageStatusDto } from './dto/update-package-status.dto';

@Injectable()
export class MembershipPackageService {
  constructor(
    private readonly membershipPackageRepository: MembershipPackageRepository,
  ) {}

  async findAll(filters: MembershipPackageFilterDto) {
    return await this.membershipPackageRepository.findAll(filters);
  }

  async findById(id: string) {
    const package_ = await this.membershipPackageRepository.findById(id, true);
    if (!package_) {
      throw new NotFoundException({
        message: 'Membership package not found',
      });
    }
    return package_;
  }

  async create(dto: CreateMembershipPackageDto) {
    const package_ = await this.membershipPackageRepository.create({
      title: dto.title,
      description: dto.description,
      price: dto.price,
      durationDays: dto.durationDays,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive === undefined ? true : dto.isActive,
    });

    if (!package_) {
      throw new BadRequestException({
        message: 'Failed to create membership package',
      });
    }

    return package_;
  }

  async update(id: string, dto: UpdateMembershipPackageDto) {
    const package_ = await this.membershipPackageRepository.findById(id, true);
    if (!package_) {
      throw new NotFoundException({
        message: 'Membership package not found',
      });
    }

    // Explicitly exclude isActive from update - it should only be updated via updateStatus endpoint
    const updateData: any = {};
    if (dto.title !== undefined) {
      updateData.title = dto.title;
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }
    if (dto.price !== undefined) {
      updateData.price = dto.price;
    }
    if (dto.durationDays !== undefined) {
      updateData.durationDays = dto.durationDays;
    }
    if (dto.sortOrder !== undefined) {
      updateData.sortOrder = dto.sortOrder;
    }

    const updatedPackage = await this.membershipPackageRepository.update(
      id,
      updateData,
    );

    if (!updatedPackage) {
      throw new BadRequestException({
        message: 'Failed to update membership package',
      });
    }

    return updatedPackage;
  }

  async updateStatus(id: string, dto: UpdatePackageStatusDto) {
    const package_ = await this.membershipPackageRepository.findById(id, true);
    if (!package_) {
      throw new NotFoundException({
        message: 'Membership package not found',
      });
    }

    if (package_.isActive === dto.isActive) {
      throw new BadRequestException({
        message: `Package is already ${dto.isActive ? 'active' : 'inactive'}`,
      });
    }

    const updatedPackage = await this.membershipPackageRepository.updateStatus(
      id,
      dto.isActive,
    );

    if (!updatedPackage) {
      throw new BadRequestException({
        message: 'Failed to update package status',
      });
    }

    return updatedPackage;
  }

  async delete(id: string) {
    const package_ = await this.membershipPackageRepository.findById(id, true);
    if (!package_) {
      throw new NotFoundException({
        message: 'Membership package not found',
      });
    }

    if (package_.deletedAt) {
      throw new BadRequestException({
        message: 'Package is already deleted',
      });
    }

    const deletedPackage =
      await this.membershipPackageRepository.softDelete(id);

    if (!deletedPackage) {
      throw new BadRequestException({
        message: 'Failed to delete package',
      });
    }

    return deletedPackage;
  }

  async restore(id: string) {
    const package_ = await this.membershipPackageRepository.findById(id, true);
    if (!package_) {
      throw new NotFoundException({
        message: 'Membership package not found',
      });
    }

    if (!package_.deletedAt) {
      throw new BadRequestException({
        message: 'Package is not deleted',
      });
    }

    const restoredPackage = await this.membershipPackageRepository.restore(id);

    if (!restoredPackage) {
      throw new BadRequestException({
        message: 'Failed to restore package',
      });
    }

    return restoredPackage;
  }
}
