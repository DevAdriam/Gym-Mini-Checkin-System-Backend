import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateImageDto {
  @ApiPropertyOptional({
    description: 'Image description or note',
    example: 'Updated payment screenshot',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
