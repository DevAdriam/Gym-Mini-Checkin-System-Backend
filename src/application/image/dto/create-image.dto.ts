import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ImageType {
  PROFILE = 'PROFILE',
  PAYMENT_SCREENSHOT = 'PAYMENT_SCREENSHOT',
}

export class CreateImageDto {
  @ApiPropertyOptional({
    description: 'Image URL (optional if file is uploaded)',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Image type',
    enum: ImageType,
    example: 'PAYMENT_SCREENSHOT',
  })
  @IsEnum(ImageType)
  type: ImageType;

  @ApiPropertyOptional({
    description: 'Image description or note',
    example: 'Initial payment screenshot',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
