import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MemberRegisterDto } from 'src/application/member/dto/member-register.dto';
import { MemberService } from 'src/application/member/member.service';
import { Member } from 'src/common/decorators/member.decorator';
import { IMemberAuth } from 'src/common/types/type';
import { BadRequestException } from 'src/core/exceptions/http/bad-request.exception';
import { MemberJWTAuthGuard } from 'src/infrastructure/auth/guard/member-jwt.guard';

@ApiTags('Members')
@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post('register')
  @ApiOperation({ summary: 'Submit a new member registration' })
  @ApiBody({ type: MemberRegisterDto })
  @HttpCode(201)
  async register(@Body() dto: MemberRegisterDto) {
    try {
      const member = await this.memberService.register(dto);
      return member;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to register member',
      });
    }
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current member profile' })
  @ApiBearerAuth()
  @UseGuards(MemberJWTAuthGuard)
  async getProfile(@Member() member: IMemberAuth) {
    try {
      const profile = await this.memberService.getProfileById(member.id);
      return profile;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to fetch member profile',
      });
    }
  }
}
