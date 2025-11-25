import { Module } from '@nestjs/common';
import { MembershipPackageRepository } from 'src/domain/membership-package/membership-package.repository';
import { MembershipPackageService } from './membership-package.service';

@Module({
  providers: [MembershipPackageService, MembershipPackageRepository],
  exports: [MembershipPackageService],
})
export class MembershipPackageModule {}
