import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MemberCheckInDto {
  @ApiProperty({
    description: 'Member ID (e.g., MEM-20240101-ABC12)',
    example: 'MEM-20240101-ABC12',
  })
  @IsString()
  @IsNotEmpty()
  memberId: string;
}
