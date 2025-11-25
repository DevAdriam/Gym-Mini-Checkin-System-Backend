import { Module } from '@nestjs/common';
import { ImageRepository } from 'src/domain/image/image.repository';
import { MemberRepository } from 'src/domain/member/member.repository';
import { ImageService } from './image.service';

@Module({
  providers: [ImageService, ImageRepository, MemberRepository],
  exports: [ImageService],
})
export class ImageModule {}
