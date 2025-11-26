import { Module } from '@nestjs/common';
import { ImageRepository } from 'src/domain/image/image.repository';
import { StorageModule } from 'src/infrastructure/storage/storage.module';
import { MemberModule } from '../member/member.module';
import { ImageService } from './image.service';

@Module({
  imports: [MemberModule, StorageModule],
  providers: [ImageService, ImageRepository],
  exports: [ImageService],
})
export class ImageModule {}
