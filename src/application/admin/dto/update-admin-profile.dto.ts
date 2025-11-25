import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAdminProfileDto {
  @ApiPropertyOptional({
    description: 'Admin name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Admin phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Admin profile image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;
}
