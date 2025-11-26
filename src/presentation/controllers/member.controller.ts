import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CheckMemberStatusDto } from 'src/application/member/dto/check-member-status.dto';
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

  @Get('check-status')
  @ApiOperation({
    summary: 'Check if member is registered by email',
    description:
      'Public endpoint to check if a member with the given email is registered. Returns member status if found.',
  })
  @ApiQuery({
    name: 'email',
    required: true,
    type: String,
    description: 'Member email address',
    example: 'john.doe@example.com',
  })
  @HttpCode(200)
  async checkMemberStatus(@Query() dto: CheckMemberStatusDto) {
    try {
      const result = await this.memberService.checkMemberStatus(dto.email);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to check member status',
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
