import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum MemberStatusFilter {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum MemberActiveFilter {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

export class MemberFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by member status',
    enum: MemberStatusFilter,
    example: 'PENDING',
  })
  @IsOptional()
  @IsEnum(MemberStatusFilter)
  status?: MemberStatusFilter;

  @ApiPropertyOptional({
    description: 'Filter by active/expired status',
    enum: MemberActiveFilter,
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsEnum(MemberActiveFilter)
  active?: MemberActiveFilter;

  @ApiPropertyOptional({
    description: 'Search by name, email, phone, or memberId',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number (for pagination)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page (for pagination)',
    example: 10,
    default: 10,
  })
  @IsOptional()
  limit?: number;
}
