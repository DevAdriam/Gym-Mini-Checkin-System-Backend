import { writeFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { document } from '../src/infrastructure/config/swagger.config';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule, { logger: false });

  // Apply the same configuration as main.ts
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: 0, // VersioningType.URI
    defaultVersion: '1',
  });

  const swaggerDocument = SwaggerModule.createDocument(app, document);
  const swaggerJson = JSON.stringify(swaggerDocument, null, 2);

  writeFileSync('./swagger.json', swaggerJson, 'utf8');
  console.log('✅ Swagger JSON generated successfully at ./swagger.json');

  await app.close();
  process.exit(0);
}

generateSwagger().catch((error) => {
  console.error('❌ Error generating Swagger JSON:', error);
  process.exit(1);
});
