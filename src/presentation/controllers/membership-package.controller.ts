import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateMembershipPackageDto } from 'src/application/membership-package/dto/create-membership-package.dto';
import { MembershipPackageFilterDto } from 'src/application/membership-package/dto/membership-package-filter.dto';
import { UpdateMembershipPackageDto } from 'src/application/membership-package/dto/update-membership-package.dto';
import { UpdatePackageStatusDto } from 'src/application/membership-package/dto/update-package-status.dto';
import { MembershipPackageService } from 'src/application/membership-package/membership-package.service';
import { BadRequestException } from 'src/core/exceptions/http/bad-request.exception';
import { AdminJWTAuthGuard } from 'src/infrastructure/auth/guard/admin-jwt.guard';

@ApiTags('Admin - Membership Packages')
@Controller('membership-packages')
@ApiBearerAuth()
@UseGuards(AdminJWTAuthGuard)
export class MembershipPackageController {
  constructor(
    private readonly membershipPackageService: MembershipPackageService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all active/inactive membership packages',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  async findAll(@Query() filterDto: MembershipPackageFilterDto) {
    try {
      const packages = await this.membershipPackageService.findAll(filterDto);
      return packages;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to fetch membership packages',
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single package details' })
  @ApiParam({
    name: 'id',
    description: 'Membership Package ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async findById(@Param('id') id: string) {
    try {
      const package_ = await this.membershipPackageService.findById(id);
      return package_;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to fetch membership package',
      });
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create new membership package' })
  @ApiBody({ type: CreateMembershipPackageDto })
  @HttpCode(201)
  async create(@Body() dto: CreateMembershipPackageDto) {
    try {
      const package_ = await this.membershipPackageService.create(dto);
      return package_;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to create membership package',
      });
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update membership package' })
  @ApiParam({
    name: 'id',
    description: 'Membership Package ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateMembershipPackageDto })
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMembershipPackageDto,
  ) {
    try {
      const package_ = await this.membershipPackageService.update(id, dto);
      return package_;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to update membership package',
      });
    }
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Activate / deactivate package (isActive)',
  })
  @ApiParam({
    name: 'id',
    description: 'Membership Package ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdatePackageStatusDto })
  @HttpCode(200)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePackageStatusDto,
  ) {
    try {
      const package_ = await this.membershipPackageService.updateStatus(
        id,
        dto,
      );
      return package_;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to update package status',
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete package (deletedAt)' })
  @ApiParam({
    name: 'id',
    description: 'Membership Package ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    try {
      const package_ = await this.membershipPackageService.delete(id);
      return package_;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to delete package',
      });
    }
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted package' })
  @ApiParam({
    name: 'id',
    description: 'Membership Package ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @HttpCode(200)
  async restore(@Param('id') id: string) {
    try {
      const package_ = await this.membershipPackageService.restore(id);
      return package_;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to restore package',
      });
    }
  }
}
