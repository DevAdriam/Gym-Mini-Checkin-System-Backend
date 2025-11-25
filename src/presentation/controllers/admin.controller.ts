import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Admin } from '@prisma/client';
import { AdminService } from 'src/application/admin/admin.service';
import { AdminLoginDto } from 'src/application/admin/dto/admin-login.dto';
import { UpdateAdminPasswordDto } from 'src/application/admin/dto/update-admin-password.dto';
import { UpdateAdminProfileDto } from 'src/application/admin/dto/update-admin-profile.dto';
import { Admin as AdminDecorator } from 'src/common/decorators/admin.decorator';
import { IAdminAuth } from 'src/common/types/type';
import { BadRequestException } from 'src/core/exceptions/http/bad-request.exception';
import { AdminJWTAuthGuard } from 'src/infrastructure/auth/guard/admin-jwt.guard';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiBody({ type: AdminLoginDto })
  @HttpCode(200)
  async login(@Body() dto: AdminLoginDto) {
    try {
      const result = await this.adminService.login(dto);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to login',
      });
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Admin logout' })
  @ApiBearerAuth()
  @UseGuards(AdminJWTAuthGuard)
  @HttpCode(200)
  async logout() {
    try {
      return await this.adminService.logout();
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to logout',
      });
    }
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current admin profile' })
  @ApiBearerAuth()
  @UseGuards(AdminJWTAuthGuard)
  async getProfile(@AdminDecorator() admin: IAdminAuth): Promise<Admin> {
    try {
      const profile = await this.adminService.getProfile(admin.id);
      return profile;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to fetch profile',
      });
    }
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update admin profile info' })
  @ApiBearerAuth()
  @UseGuards(AdminJWTAuthGuard)
  async updateProfile(
    @AdminDecorator() admin: IAdminAuth,
    @Body() dto: UpdateAdminProfileDto,
  ): Promise<Admin> {
    try {
      const updatedAdmin = await this.adminService.updateProfile(admin.id, dto);
      return updatedAdmin;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to update profile',
      });
    }
  }

  @Patch('password')
  @ApiOperation({ summary: 'Update admin password' })
  @ApiBearerAuth()
  @UseGuards(AdminJWTAuthGuard)
  @ApiBody({ type: UpdateAdminPasswordDto })
  async updatePassword(
    @AdminDecorator() admin: IAdminAuth,
    @Body() dto: UpdateAdminPasswordDto,
  ) {
    try {
      return await this.adminService.updatePassword(admin.id, dto);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to update password',
      });
    }
  }
}
