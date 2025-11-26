import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { CreateImageDto } from 'src/application/image/dto/create-image.dto';
import { UpdateImageDto } from 'src/application/image/dto/update-image.dto';
import { ImageService } from 'src/application/image/image.service';
import { BadRequestException } from 'src/core/exceptions/http/bad-request.exception';
import { AdminJWTAuthGuard } from 'src/infrastructure/auth/guard/admin-jwt.guard';
import { StorageService } from 'src/infrastructure/storage/storage.service';

@ApiTags('Admin - Images')
@Controller()
@ApiBearerAuth()
@UseGuards(AdminJWTAuthGuard)
export class ImageController {
  private readonly maxFileSize: number;

  constructor(
    private readonly imageService: ImageService,
    private readonly storageService: StorageService,
  ) {
    // Ensure storageService is available
    if (!this.storageService) {
      throw new Error('StorageService is required');
    }
    this.maxFileSize = this.storageService.getFileSizeLimit();
  }

  @Get('members/:id/images')
  @ApiOperation({
    summary: 'Get all payment screenshots and profile images for a member',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async getMemberImages(@Param('id') memberId: string) {
    try {
      const images = await this.imageService.getMemberImages(memberId);
      return images;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to fetch images',
      });
    }
  }

  @Post('members/:id/images')
  @ApiOperation({
    summary: 'Add new image (profile or payment screenshot)',
    description:
      'Upload an image file or provide an imageUrl. File upload is preferred.',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, GIF, WEBP)',
        },
        type: {
          type: 'string',
          enum: ['PROFILE', 'PAYMENT_SCREENSHOT'],
          description: 'Image type',
        },
        description: {
          type: 'string',
          description: 'Image description (optional)',
        },
        imageUrl: {
          type: 'string',
          description: 'Image URL (optional if file is uploaded)',
        },
      },
      required: ['type'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'temp');
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              `Invalid file type. Only ${allowedMimeTypes.join(', ')} are allowed.`,
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @HttpCode(201)
  async addImage(
    @Param('id') memberId: string,
    @Body() dto: CreateImageDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024, // 5MB
          }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    try {
      // Move file to appropriate directory based on type
      if (file) {
        const destination = dto.type === 'PROFILE' ? 'profiles' : 'payments';
        const fs = require('node:fs');
        const path = require('node:path');
        const oldPath = file.path;
        const newDir = path.join(
          this.storageService.getUploadPath(),
          destination,
        );
        if (!require('node:fs').existsSync(newDir)) {
          require('node:fs').mkdirSync(newDir, { recursive: true });
        }
        const newPath = path.join(newDir, file.filename);
        fs.renameSync(oldPath, newPath);
        file.path = newPath;
      }

      const image = await this.imageService.addImage(memberId, dto, file);
      return image;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to add image',
      });
    }
  }

  @Patch('images/:id')
  @ApiOperation({
    summary: 'Update image metadata (description)',
  })
  @ApiParam({
    name: 'id',
    description: 'Image ID (UUID or profile-{memberId})',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateImageDto })
  @HttpCode(200)
  async updateImage(@Param('id') id: string, @Body() dto: UpdateImageDto) {
    try {
      const image = await this.imageService.updateImage(id, dto);
      return image;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to update image',
      });
    }
  }

  @Delete('images/:id')
  @ApiOperation({ summary: 'Delete single image' })
  @ApiParam({
    name: 'id',
    description: 'Image ID (UUID or profile-{memberId})',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @HttpCode(200)
  async deleteImage(@Param('id') id: string) {
    try {
      return await this.imageService.deleteImage(id);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message,
        });
      }
      throw new BadRequestException({
        message: 'Failed to delete image',
      });
    }
  }
}
