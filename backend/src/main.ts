import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/payments/webhook', bodyParser.raw({ type: '*/*' }));

  const config = new DocumentBuilder()
    .setTitle('Pizza API')
    .setDescription('API for managing pizzas, orders, reviews, and deliveries')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const logger = new Logger('Bootstrap');
  await app.listen(3333);
  logger.log('App is running on http://localhost:3333');
}
bootstrap();
