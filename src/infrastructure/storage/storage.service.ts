import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { Env } from '../config/env.config';

@Injectable()
export class StorageService {
  private readonly uploadPath: string;

  constructor(private readonly configService: ConfigService<Env>) {
    // Set upload directory based on environment
    const uploadDir = this.configService.get<string>('UPLOAD_DIR') || 'uploads';
    this.uploadPath = join(process.cwd(), uploadDir);

    // Create upload directory if it doesn't exist
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists(): void {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }

    // Create subdirectories for different image types
    const subdirs = ['profiles', 'payments', 'temp'];
    subdirs.forEach((dir) => {
      const dirPath = join(this.uploadPath, dir);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  /**
   * Get multer storage configuration for file uploads
   */
  getMulterStorageConfig(
    destination: 'profiles' | 'payments' | 'temp' = 'temp',
  ) {
    return diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = join(this.uploadPath, destination);
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        // Generate unique filename: timestamp-random-originalname
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;
        cb(null, filename);
      },
    });
  }

  /**
   * Get file filter for images
   */
  getImageFileFilter() {
    return (
      req: any,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      // Accept only image files
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
    };
  }

  /**
   * Get file size limit (in bytes)
   * Default: 5MB
   */
  getFileSizeLimit(): number {
    const maxSize =
      this.configService.get<number>('MAX_FILE_SIZE') || 5 * 1024 * 1024; // 5MB default
    return maxSize;
  }

  /**
   * Get full file path
   */
  getFilePath(destination: string, filename: string): string {
    return join(this.uploadPath, destination, filename);
  }

  /**
   * Get file URL (for serving files)
   */
  getFileUrl(destination: string, filename: string): string {
    let baseUrl = this.configService.get<string>('BASE_URL');

    // If BASE_URL is not set, construct it from PORT
    if (!baseUrl) {
      const port = this.configService.get<number>('PORT') || 4000;
      baseUrl = `http://localhost:${port}`;
    }

    return `${baseUrl}/uploads/${destination}/${filename}`;
  }

  /**
   * Get upload directory path
   */
  getUploadPath(): string {
    return this.uploadPath;
  }
}
