import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CheckInService } from 'src/application/checkin/checkin.service';
import { CheckInFilterDto } from 'src/application/checkin/dto/checkin-filter.dto';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationParam } from 'src/common/types/type';
import { BadRequestException } from 'src/core/exceptions/http/bad-request.exception';
import { AdminJWTAuthGuard } from 'src/infrastructure/auth/guard/admin-jwt.guard';

@ApiTags('Admin - Check-ins')
@Controller()
@ApiBearerAuth()
// @UseGuards(AdminJWTAuthGuard)
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Get('checkins')
  @ApiOperation({
    summary:
      'List all check-in logs (optional filter by member, date range, status)',
  })
  @ApiQuery({ name: 'memberId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['ALLOWED', 'DENIED'] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findAll(
    @Query() filterDto: CheckInFilterDto,
    @Pagination() pagination: PaginationParam & { page: number; limit: number },
  ) {
    try {
      const result = await this.checkInService.findAll(filterDto);
      return {
        data: result.checkIns,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / pagination.limit),
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to fetch check-in logs',
      });
    }
  }

  @Get('members/:id/checkins')
  @ApiOperation({
    summary: 'List check-in logs for a specific member',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({ name: 'status', required: false, enum: ['ALLOWED', 'DENIED'] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findByMemberId(
    @Param('id') memberId: string,
    @Query() filterDto: CheckInFilterDto,
    @Pagination() pagination: PaginationParam & { page: number; limit: number },
  ) {
    try {
      const result = await this.checkInService.findByMemberId(
        memberId,
        filterDto,
      );
      return {
        data: result.checkIns,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / pagination.limit),
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to fetch member check-in logs',
      });
    }
  }
}
