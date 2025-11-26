import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from 'src/core/exceptions/http/bad-request.exception';
import { NotFoundException } from 'src/core/exceptions/http/not-found.exception';
import { CheckInRepository } from 'src/domain/checkin/checkin.repository';
import { MemberRepository } from 'src/domain/member/member.repository';
import { Env } from 'src/infrastructure/config/env.config';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { MemberGateway } from 'src/infrastructure/websocket/member.gateway';
import { MemberRegisterDto } from './dto/member-register.dto';

@Injectable()
export class MemberService {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env>,
    @Inject(forwardRef(() => MemberGateway))
    private readonly memberGateway: MemberGateway,
    private readonly checkInRepository: CheckInRepository,
  ) {}

  async register(dto: MemberRegisterDto) {
    // Validate that either email or phone is provided
    if (!dto.email && !dto.phone) {
      throw new BadRequestException({
        message: 'Either email or phone must be provided',
      });
    }

    // Check if membership package exists and is active
    const membershipPackage =
      await this.prismaService.membershipPackage.findFirst({
        where: {
          id: dto.membershipPackageId,
          isActive: true,
          deletedAt: null,
        },
      });

    if (!membershipPackage) {
      throw new NotFoundException({
        message: 'Membership package not found or inactive',
      });
    }

    // Check for duplicate email if provided
    if (dto.email) {
      const existingMember = await this.memberRepository.findByEmail(dto.email);
      if (existingMember) {
        throw new BadRequestException({
          message: 'Member with this email already exists',
        });
      }
    }

    // Check for duplicate phone if provided
    if (dto.phone) {
      const existingMember = await this.memberRepository.findByPhone(dto.phone);
      if (existingMember) {
        throw new BadRequestException({
          message: 'Member with this phone already exists',
        });
      }
    }

    // Generate unique memberId (you can customize this logic)
    const memberId = await this.generateUniqueMemberId();

    // Create member with PENDING status
    const member = await this.memberRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      profilePhoto: dto.profilePhoto,
      memberId,
      status: 'PENDING',
      membershipPackageId: dto.membershipPackageId,
      paymentScreenshots: dto.paymentScreenshots,
    });

    if (!member) {
      throw new BadRequestException({
        message: 'Failed to register member',
      });
    }

    // Emit WebSocket event for new member registration
    try {
      this.memberGateway.emitMemberRegistered(member);
    } catch (error) {
      // Log error but don't fail the registration
      console.error('Failed to emit member registered event:', error);
    }

    return member;
  }

  async getProfile(memberId: string) {
    const member = await this.memberRepository.findByMemberId(memberId);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
      });
    }
    return member;
  }

  async checkMemberStatus(email: string) {
    const member = await this.memberRepository.findByEmail(email);

    if (!member) {
      return {
        registered: false,
        message: 'Member not found with this email',
      };
    }

    // Check if member is soft-deleted
    if (member.deletedAt) {
      return {
        registered: false,
        message: 'Member account has been deleted',
        deletedAt: member.deletedAt,
      };
    }

    // Check the latest check-in record to determine current check-in status
    const latestCheckIn = await this.checkInRepository.findLatestCheckInRecord(
      member.id,
    );

    let currentCheckInStatus:
      | 'checked_in'
      | 'checked_out'
      | 'never_checked_in' = 'never_checked_in';
    let currentCheckIn: any = null;

    if (latestCheckIn) {
      if (
        latestCheckIn.checkOutTime === null &&
        latestCheckIn.status === 'ALLOWED'
      ) {
        currentCheckInStatus = 'checked_in';
        currentCheckIn = {
          id: latestCheckIn.id,
          checkInTime: latestCheckIn.checkInTime,
          status: latestCheckIn.status,
        };
      } else {
        currentCheckInStatus = 'checked_out';
        currentCheckIn = {
          id: latestCheckIn.id,
          checkInTime: latestCheckIn.checkInTime,
          checkOutTime: latestCheckIn.checkOutTime,
          status: latestCheckIn.status,
        };
      }
    }

    return {
      registered: true,
      member: {
        id: member.id,
        memberId: member.memberId,
        name: member.name,
        email: member.email,
        phone: member.phone,
        status: member.status,
        startDate: member.startDate,
        endDate: member.endDate,
        membershipPackage: member.membershipPackage,
      },
      currentCheckInStatus,
      currentCheckIn,
    };
  }

  async getProfileById(id: string) {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
      });
    }
    return member;
  }

  async findAll(filters: any, page = 1, limit = 10) {
    return await this.memberRepository.findAll(filters, page, limit);
  }

  async getMemberDetail(id: string) {
    const member = await this.memberRepository.findById(id, true); // Include deleted for admin view
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
      });
    }
    return member;
  }

  async approveMember(id: string) {
    const member = await this.memberRepository.findById(id, true);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
      });
    }

    if (member.status === 'APPROVED') {
      throw new BadRequestException({
        message: 'Member is already approved',
      });
    }

    // Get membership package to calculate dates
    const membershipPackage =
      await this.prismaService.membershipPackage.findUnique({
        where: { id: member.membershipPackageId },
      });

    if (!membershipPackage) {
      throw new NotFoundException({
        message: 'Membership package not found',
      });
    }

    // Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + membershipPackage.durationDays);

    // Update member status and dates
    const updatedMember = await this.memberRepository.update(id, {
      status: 'APPROVED',
      startDate,
      endDate,
    });

    if (!updatedMember) {
      throw new BadRequestException({
        message: 'Failed to approve member',
      });
    }

    // Emit WebSocket event for member approval
    try {
      this.memberGateway.emitMemberApproved(updatedMember);
    } catch (error) {
      console.error('Failed to emit member approved event:', error);
    }

    return updatedMember;
  }

  async rejectMember(id: string) {
    const member = await this.memberRepository.findById(id, true);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
      });
    }

    if (member.status === 'REJECTED') {
      throw new BadRequestException({
        message: 'Member is already rejected',
      });
    }

    const updatedMember = await this.memberRepository.updateStatus(
      id,
      'REJECTED',
    );

    if (!updatedMember) {
      throw new BadRequestException({
        message: 'Failed to reject member',
      });
    }

    // Emit WebSocket event for member status update
    try {
      this.memberGateway.emitMemberStatusUpdated(updatedMember);
    } catch (error) {
      console.error('Failed to emit member status updated event:', error);
    }

    return updatedMember;
  }

  async deleteMember(id: string) {
    const member = await this.memberRepository.findById(id, true);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
      });
    }

    if (member.deletedAt) {
      throw new BadRequestException({
        message: 'Member is already deleted',
      });
    }

    const deletedMember = await this.memberRepository.softDelete(id);

    if (!deletedMember) {
      throw new BadRequestException({
        message: 'Failed to delete member',
      });
    }

    return deletedMember;
  }

  async restoreMember(id: string) {
    const member = await this.memberRepository.findById(id, true);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
      });
    }

    if (!member.deletedAt) {
      throw new BadRequestException({
        message: 'Member is not deleted',
      });
    }

    const restoredMember = await this.memberRepository.restore(id);

    if (!restoredMember) {
      throw new BadRequestException({
        message: 'Failed to restore member',
      });
    }

    return restoredMember;
  }

  verifyToken(token: string): Promise<Record<string, unknown>> {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
    });
  }

  private async generateUniqueMemberId(): Promise<string> {
    // Generate a unique member ID (e.g., MEM-YYYYMMDD-XXXXX)
    const prefix = 'MEM';
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replaceAll('-', '');
    const randomStr = Math.random().toString(36).slice(2, 7).toUpperCase();

    let memberId = `${prefix}-${dateStr}-${randomStr}`;
    let exists = await this.memberRepository.findByMemberId(memberId);

    // Regenerate if ID already exists (unlikely but possible)
    while (exists) {
      const newRandomStr = Math.random().toString(36).slice(2, 7).toUpperCase();
      memberId = `${prefix}-${dateStr}-${newRandomStr}`;
      exists = await this.memberRepository.findByMemberId(memberId);
    }

    return memberId;
  }
}
