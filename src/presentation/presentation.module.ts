import { Module } from '@nestjs/common';
import { AdminModule } from 'src/application/admin/admin.module';
import { AuthModule } from 'src/application/auth/auth.module';
import { CheckInModule } from 'src/application/checkin/checkin.module';
import { ImageModule } from 'src/application/image/image.module';
import { MemberModule } from 'src/application/member/member.module';
import { MembershipPackageModule } from 'src/application/membership-package/membership-package.module';
import { UserModule } from 'src/application/user/user.module';
import { StorageModule } from 'src/infrastructure/storage/storage.module';
import { AdminMemberController } from './controllers/admin-member.controller';
import { AdminController } from './controllers/admin.controller';
import { AuthController } from './controllers/auth.controller';
import { CheckInController } from './controllers/checkin.controller';
import { ImageController } from './controllers/image.controller';
import { MemberCheckInController } from './controllers/member-checkin.controller';
import { MemberController } from './controllers/member.controller';
import { MembershipPackageController } from './controllers/membership-package.controller';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [
    UserModule,
    AuthModule,
    AdminModule,
    MemberModule,
    MembershipPackageModule,
    ImageModule,
    CheckInModule,
    StorageModule,
  ],
  controllers: [
    UserController,
    AuthController,
    AdminController,
    MemberController,
    AdminMemberController,
    MembershipPackageController,
    ImageController,
    CheckInController,
    MemberCheckInController,
  ],
  providers: [],
})
export class PresentationModule {}
