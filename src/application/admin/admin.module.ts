import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HashService } from 'src/common/service/hash.service';
import { AdminRepository } from 'src/domain/admin/admin.repository';
import { AdminJWTStrategy } from 'src/infrastructure/auth/strategy/admin-jwt-strategy';
import { AdminService } from './admin.service';

@Module({
  imports: [
    JwtModule,
    PassportModule.register({ defaultStrategy: 'admin-jwt' }),
  ],
  providers: [AdminService, AdminRepository, HashService, AdminJWTStrategy],
  exports: [AdminService],
})
export class AdminModule {}
