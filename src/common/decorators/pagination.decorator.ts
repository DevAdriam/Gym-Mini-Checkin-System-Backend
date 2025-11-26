import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { BadRequestException } from 'src/core/exceptions/http/bad-request.exception';
import { PaginationParam } from '../types/type';

export const Pagination = createParamDecorator(
  (data: unknown, context: ExecutionContext): PaginationParam => {
    const request: Request = context.switchToHttp().getRequest();

    // Support both 'limit' and 'size' for backward compatibility
    const limitParam = request.query['limit'] || request.query['size'];
    const pageParam = request.query['page'];

    // Convert to numbers with defaults
    const page = pageParam ? Number(pageParam) : 1;
    const limit = limitParam ? Number(limitParam) : 10;

    // Validate page
    if (isNaN(page) || page < 1) {
      throw new BadRequestException({
        message: 'Page must be a positive integer',
      });
    }

    // Validate limit
    if (isNaN(limit) || limit < 1) {
      throw new BadRequestException({
        message: 'Limit must be a positive integer',
      });
    }

    // Check maximum limit
    if (limit > 1000) {
      throw new BadRequestException({
        message: 'Limit cannot exceed 1000',
      });
    }

    return {
      take: limit,
      skip: (page - 1) * limit,
      page,
      limit,
    } as PaginationParam & { page: number; limit: number };
  },
);
