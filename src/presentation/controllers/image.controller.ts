import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateImageDto } from 'src/application/image/dto/create-image.dto';
import { UpdateImageDto } from 'src/application/image/dto/update-image.dto';
import { ImageService } from 'src/application/image/image.service';
import { BadRequestException } from 'src/core/exceptions/http/bad-request.exception';
import { AdminJWTAuthGuard } from 'src/infrastructure/auth/guard/admin-jwt.guard';

@ApiTags('Admin - Images')
@Controller()
@ApiBearerAuth()
@UseGuards(AdminJWTAuthGuard)
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

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
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: CreateImageDto })
  @HttpCode(201)
  async addImage(@Param('id') memberId: string, @Body() dto: CreateImageDto) {
    try {
      const image = await this.imageService.addImage(memberId, dto);
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
