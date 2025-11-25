import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMembershipPackageDto {
  @ApiProperty({
    description: 'Package title',
    example: 'Monthly Membership',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Package description',
    example: 'Access to all gym facilities for one month',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Package price',
    example: 50_000,
  })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Duration in days',
    example: 30,
  })
  @IsInt()
  @Min(1)
  durationDays: number;

  @ApiPropertyOptional({
    description: 'Sort order for display',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether package is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
