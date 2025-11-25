import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdatePackageStatusDto {
  @ApiProperty({
    description: 'Package active status',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}
