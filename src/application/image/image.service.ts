import { Injectable } from '@nestjs/common';
import { BadRequestException } from 'src/core/exceptions/http/bad-request.exception';
import { NotFoundException } from 'src/core/exceptions/http/not-found.exception';
import { ImageRepository } from 'src/domain/image/image.repository';
import { MemberRepository } from 'src/domain/member/member.repository';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class ImageService {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly memberRepository: MemberRepository,
    private readonly storageService: StorageService,
  ) {}

  async getMemberImages(memberId: string) {
    const member = await this.memberRepository.findById(memberId, true);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
      });
    }

    return await this.imageRepository.findByMemberId(memberId);
  }

  async addImage(
    memberId: string,
    dto: CreateImageDto,
    file?: Express.Multer.File,
  ) {
    const member = await this.memberRepository.findById(memberId, true);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
      });
    }

    // If file is provided, use it; otherwise use imageUrl from DTO
    let imageUrl: string;
    if (file) {
      // Determine destination based on image type
      const destination = dto.type === 'PROFILE' ? 'profiles' : 'payments';
      imageUrl = this.storageService.getFileUrl(destination, file.filename);
    } else if (dto.imageUrl) {
      imageUrl = dto.imageUrl;
    } else {
      throw new BadRequestException({
        message: 'Either file or imageUrl must be provided',
      });
    }

    const image = await this.imageRepository.create(memberId, {
      imageUrl,
      type: dto.type,
      description: dto.description,
    });

    if (!image) {
      throw new BadRequestException({
        message: 'Failed to add image',
      });
    }

    return image;
  }

  async updateImage(id: string, dto: UpdateImageDto) {
    const image = await this.imageRepository.findById(id);
    if (!image) {
      throw new NotFoundException({
        message: 'Image not found',
      });
    }

    const updatedImage = await this.imageRepository.update(id, {
      description: dto.description,
    });

    if (!updatedImage) {
      throw new BadRequestException({
        message: 'Failed to update image',
      });
    }

    return updatedImage;
  }

  async deleteImage(id: string) {
    const image = await this.imageRepository.findById(id);
    if (!image) {
      throw new NotFoundException({
        message: 'Image not found',
      });
    }

    const deleted = await this.imageRepository.delete(id);
    if (!deleted) {
      throw new BadRequestException({
        message: 'Failed to delete image',
      });
    }

    return { message: 'Image deleted successfully' };
  }
}
