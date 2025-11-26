import { DocumentBuilder } from '@nestjs/swagger';

export const document = new DocumentBuilder()
  .setTitle('Gym Mini Check-in System API')
  .setDescription('API documentation for Gym Mini Check-in System')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
