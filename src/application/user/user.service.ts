import { Injectable } from '@nestjs/common';
import { HashService } from 'src/common/service/hash.service';

// Note: UserService methods removed as User model no longer exists
// Password hashing/verification methods moved to HashService (already exists)
// Admin authentication is handled in AdminService

@Injectable()
export class UserService {
  constructor(private readonly hashService: HashService) {}

  async hashPassword(password: string) {
    return await this.hashService.hash(password);
  }

  async verifyPassword(password: string, hashedPassword: string) {
    return await this.hashService.compare(password, hashedPassword);
  }
}
