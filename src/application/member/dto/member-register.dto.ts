import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

export class PaymentScreenshotDto {
  @ApiProperty({
    description: 'Payment screenshot image URL',
    example: 'https://example.com/payment-screenshot.jpg',
  })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Optional description or note about the payment',
    example: 'Initial membership payment',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class MemberRegisterDto {
  @ApiProperty({
    description: 'Member full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Member email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Member password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: 'Member phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Member profile photo URL',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @ApiProperty({
    description: 'Membership package ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  membershipPackageId: string;

  @ApiProperty({
    description: 'Payment screenshots',
    type: [PaymentScreenshotDto],
    example: [
      {
        imageUrl: 'https://example.com/payment1.jpg',
        description: 'Initial payment',
      },
    ],
  })
  @IsNotEmpty()
  paymentScreenshots: PaymentScreenshotDto[];
}
