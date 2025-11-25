import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ImageType {
  PROFILE = 'PROFILE',
  PAYMENT_SCREENSHOT = 'PAYMENT_SCREENSHOT',
}

export class CreateImageDto {
  @ApiProperty({
    description: 'Image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

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
