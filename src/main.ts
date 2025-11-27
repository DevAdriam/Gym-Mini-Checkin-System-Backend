import { join } from 'node:path';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http/http-exception.filter';
import { Env } from './infrastructure/config/env.config';
import { document } from './infrastructure/config/swagger.config';

const configService = new ConfigService<Env>();
const logger = new Logger();

async function bootstrap() {
  const port: number = configService.get<number>('PORT') as unknown as number;
  const defaultVersion = configService.get<string>(
    'DEFAULT_API_VERSION',
  ) as unknown as string;
  const uploadDir = configService.get<string>('UPLOAD_DIR') || 'uploads';

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure static file serving for uploads
  app.useStaticAssets(join(process.cwd(), uploadDir), {
    prefix: '/uploads',
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(configService));
  app.enableCors({
    origin: '*',
  });
  const documentFactory = () => SwaggerModule.createDocument(app, document);
  SwaggerModule.setup('/docs', app, documentFactory);

  await app.listen(port, () => {
    logger.log(`Application is running on port ${port}`);
  });
}
bootstrap().catch((error) => {
  error;
});
