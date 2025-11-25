import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MemberFilterDto } from 'src/application/member/dto/member-filter.dto';
import { MemberService } from 'src/application/member/member.service';
import { BadRequestException } from 'src/core/exceptions/http/bad-request.exception';
import { AdminJWTAuthGuard } from 'src/infrastructure/auth/guard/admin-jwt.guard';

@ApiTags('Admin - Members')
@Controller('members')
@ApiBearerAuth()
@UseGuards(AdminJWTAuthGuard)
export class AdminMemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  @ApiOperation({ summary: 'List all members with filters' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  @ApiQuery({ name: 'active', required: false, enum: ['ACTIVE', 'EXPIRED'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findAll(@Query() filterDto: MemberFilterDto) {
    try {
      const page = filterDto.page || 1;
      const limit = filterDto.limit || 10;
      const result = await this.memberService.findAll(
        {
          status: filterDto.status,
          active: filterDto.active,
          search: filterDto.search,
        },
        page,
        limit,
      );

      return {
        data: result.members,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to fetch members',
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member detail (membership info + images)' })
  @ApiParam({
    name: 'id',
    description: 'Member ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async getMemberDetail(@Param('id') id: string) {
    try {
      const member = await this.memberService.getMemberDetail(id);
      return member;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to fetch member detail',
      });
    }
  }

  @Patch(':id/approve')
  @ApiOperation({
    summary:
      'Approve member registration (sets status = APPROVED, calculates startDate & endDate)',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @HttpCode(200)
  async approveMember(@Param('id') id: string) {
    try {
      const member = await this.memberService.approveMember(id);
      return member;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to approve member',
      });
    }
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject member registration (status = REJECTED)',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @HttpCode(200)
  async rejectMember(@Param('id') id: string) {
    try {
      const member = await this.memberService.rejectMember(id);
      return member;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to reject member',
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete member (deletedAt)' })
  @ApiParam({
    name: 'id',
    description: 'Member ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @HttpCode(200)
  async deleteMember(@Param('id') id: string) {
    try {
      const member = await this.memberService.deleteMember(id);
      return member;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to delete member',
      });
    }
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted member' })
  @ApiParam({
    name: 'id',
    description: 'Member ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @HttpCode(200)
  async restoreMember(@Param('id') id: string) {
    try {
      const member = await this.memberService.restoreMember(id);
      return member;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to restore member',
      });
    }
  }
}
