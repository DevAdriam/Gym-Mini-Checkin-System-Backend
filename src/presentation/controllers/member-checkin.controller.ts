import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckInService } from 'src/application/checkin/checkin.service';
import { MemberCheckInDto } from 'src/application/checkin/dto/member-checkin.dto';
import { BadRequestException } from 'src/core/exceptions/http/bad-request.exception';

@ApiTags('Check-in / Check-out')
@Controller('checkin')
export class MemberCheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post()
  @ApiOperation({
    summary: 'Member attempts to check in (via memberId)',
    description:
      'Validates membership status and creates a check-in log. Returns ALLOWED if membership is approved and not expired, otherwise DENIED with reason.',
  })
  @ApiBody({ type: MemberCheckInDto })
  @HttpCode(200)
  async checkIn(@Body() dto: MemberCheckInDto) {
    try {
      const result = await this.checkInService.checkIn(dto);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to process check-in',
      });
    }
  }

  @Post('checkout')
  @ApiOperation({
    summary: 'Member attempts to check out (via memberId)',
    description:
      'Finds the latest active check-in for the member and records the checkout time. Returns checkout details including duration.',
  })
  @ApiBody({ type: MemberCheckInDto })
  @HttpCode(200)
  async checkOut(@Body() dto: MemberCheckInDto) {
    try {
      const result = await this.checkInService.checkOut(dto);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to process checkout',
      });
    }
  }
}
