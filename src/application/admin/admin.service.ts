import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HashService } from 'src/common/service/hash.service';
import { BadRequestException } from 'src/core/exceptions/http/bad-request.exception';
import { NotFoundException } from 'src/core/exceptions/http/not-found.exception';
import { UnauthorizedException } from 'src/core/exceptions/http/unauthorized.exception';
import { AdminRepository } from 'src/domain/admin/admin.repository';
import { Env } from 'src/infrastructure/config/env.config';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UpdateAdminPasswordDto } from './dto/update-admin-password.dto';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env>,
  ) {}

  async login(dto: AdminLoginDto) {
    const admin = await this.adminRepository.findByEmail(dto.email);
    if (!admin) {
      throw new NotFoundException({
        message: 'Admin not found',
      });
    }

    if (admin.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        message: 'Admin account is not active',
      });
    }

    const verifyPassword = await this.hashService.compare(
      dto.password,
      admin.password,
    );

    if (!verifyPassword) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
      });
    }

    // Update last login
    await this.adminRepository.updateLastLogin(admin.id);

    const accessToken = await this.generateToken({
      id: admin.id,
      role: 'admin',
    });
    return { accessToken, admin };
  }

  async getProfile(id: string) {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundException({
        message: 'Admin not found',
      });
    }
    return admin;
  }

  async updateProfile(id: string, dto: UpdateAdminProfileDto) {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundException({
        message: 'Admin not found',
      });
    }

    const updatedAdmin = await this.adminRepository.update(id, {
      name: dto.name,
      phone: dto.phone,
      image: dto.image,
    });

    if (!updatedAdmin) {
      throw new BadRequestException({
        message: 'Failed to update admin profile',
      });
    }

    return updatedAdmin;
  }

  async updatePassword(id: string, dto: UpdateAdminPasswordDto) {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundException({
        message: 'Admin not found',
      });
    }

    const verifyPassword = await this.hashService.compare(
      dto.currentPassword,
      admin.password,
    );

    if (!verifyPassword) {
      throw new UnauthorizedException({
        message: 'Current password is incorrect',
      });
    }

    const hashedPassword = await this.hashService.hash(dto.newPassword);
    const updatedAdmin = await this.adminRepository.updatePassword(
      id,
      hashedPassword,
    );

    if (!updatedAdmin) {
      throw new BadRequestException({
        message: 'Failed to update password',
      });
    }

    return { message: 'Password updated successfully' };
  }

  async logout() {
    // For JWT, logout is typically handled client-side by removing the token
    // If you need server-side logout, implement token blacklisting
    return { message: 'Logged out successfully' };
  }

  private async generateToken(payload: Record<string, unknown>) {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      expiresIn: this.configService.get<string>('TOKEN_EXPIRATION_TIME'),
    });
  }

  verifyToken(token: string): Promise<Record<string, unknown>> {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
    });
  }
}
