import { Injectable } from '@nestjs/common';
import { BadRequestException } from 'src/core/exceptions/http/bad-request.exception';
import { NotFoundException } from 'src/core/exceptions/http/not-found.exception';
import { CheckInRepository } from 'src/domain/checkin/checkin.repository';
import { MemberRepository } from 'src/domain/member/member.repository';
import { CheckInFilterDto } from './dto/checkin-filter.dto';
import { MemberCheckInDto } from './dto/member-checkin.dto';

@Injectable()
export class CheckInService {
  constructor(
    private readonly checkInRepository: CheckInRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  async findAll(filterDto: CheckInFilterDto) {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;

    const filters: any = {};
    if (filterDto.memberId) {
      filters.memberId = filterDto.memberId;
    }
    if (filterDto.status) {
      filters.status = filterDto.status;
    }
    if (filterDto.startDate) {
      filters.startDate = new Date(filterDto.startDate);
    }
    if (filterDto.endDate) {
      filters.endDate = new Date(filterDto.endDate);
    }

    return await this.checkInRepository.findAll(filters, page, limit);
  }

  async findByMemberId(memberId: string, filterDto: CheckInFilterDto) {
    const member = await this.memberRepository.findById(memberId, true);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
      });
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;

    const filters: any = {};
    if (filterDto.status) {
      filters.status = filterDto.status;
    }
    if (filterDto.startDate) {
      filters.startDate = new Date(filterDto.startDate);
    }
    if (filterDto.endDate) {
      filters.endDate = new Date(filterDto.endDate);
    }

    return await this.checkInRepository.findByMemberId(
      memberId,
      filters,
      page,
      limit,
    );
  }

  async checkIn(dto: MemberCheckInDto) {
    // Find member by memberId
    const member = await this.memberRepository.findByMemberId(dto.memberId);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
      });
    }

    // Check if member is deleted
    if (member.deletedAt) {
      throw new BadRequestException({
        message: 'Member account is deleted',
      });
    }

    // Validate membership status
    let status: 'ALLOWED' | 'DENIED' = 'ALLOWED';
    let reason: string | null = null;

    // Check if membership is approved
    if (member.status === 'APPROVED') {
      // Check if membership is expired
      if (member.endDate) {
        const now = new Date();
        const endDate = new Date(member.endDate);

        if (now > endDate) {
          status = 'DENIED';
          reason = `Membership expired on ${endDate.toISOString().split('T')[0]}`;
        }
      } else {
        // No end date set (shouldn't happen for approved members, but handle it)
        status = 'DENIED';
        reason = 'Membership end date is not set';
      }
    } else {
      status = 'DENIED';
      if (member.status === 'PENDING') {
        reason = 'Membership registration is pending approval';
      } else if (member.status === 'REJECTED') {
        reason = 'Membership registration was rejected';
      } else {
        reason = 'Membership is not active';
      }
    }

    // Create check-in log
    const checkInLog = await this.checkInRepository.create({
      memberId: member.id,
      status,
      reason,
      checkInTime: new Date(),
    });

    if (!checkInLog) {
      throw new BadRequestException({
        message: 'Failed to create check-in log',
      });
    }

    return {
      success: status === 'ALLOWED',
      status,
      reason,
      checkIn: checkInLog,
      member: {
        id: member.id,
        name: member.name,
        memberId: member.memberId,
        membershipPackage: member.membershipPackage,
        startDate: member.startDate,
        endDate: member.endDate,
      },
    };
  }

  async checkOut(dto: MemberCheckInDto) {
    // Find member by memberId
    const member = await this.memberRepository.findByMemberId(dto.memberId);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
      });
    }

    // Check if member is deleted
    if (member.deletedAt) {
      throw new BadRequestException({
        message: 'Member account is deleted',
      });
    }

    // Find the latest check-in that hasn't been checked out
    const latestCheckIn = await this.checkInRepository.findLatestCheckIn(
      member.id,
    );

    if (!latestCheckIn) {
      throw new BadRequestException({
        message: 'No active check-in found. Please check in first.',
      });
    }

    // Check if already checked out
    if (latestCheckIn.checkOutTime) {
      throw new BadRequestException({
        message: 'Already checked out',
      });
    }

    // Update check-out time
    const checkOutTime = new Date();
    const updatedCheckIn = await this.checkInRepository.updateCheckOut(
      latestCheckIn.id,
      checkOutTime,
    );

    if (!updatedCheckIn) {
      throw new BadRequestException({
        message: 'Failed to process checkout',
      });
    }

    // Calculate duration in minutes
    const durationMs =
      checkOutTime.getTime() - latestCheckIn.checkInTime.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    return {
      success: true,
      message: 'Checkout successful',
      checkIn: updatedCheckIn,
      duration: {
        minutes: durationMinutes,
        hours: Math.floor(durationMinutes / 60),
        minutesRemainder: durationMinutes % 60,
      },
      member: {
        id: member.id,
        name: member.name,
        memberId: member.memberId,
      },
    };
  }
}
