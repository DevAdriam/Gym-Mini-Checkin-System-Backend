import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UserRepositoryInterface } from './user.repository.interface';

// Note: UserRepository methods removed as User model no longer exists
// This class kept for reference but methods are empty

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(private readonly databaseService: PrismaService) {}
  // User model removed from schema - repository methods no longer needed
}
