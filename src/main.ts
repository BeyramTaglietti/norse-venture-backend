import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  patchNestJsSwagger();
  const config = new DocumentBuilder()
    .setTitle('Norse Venture')
    .setDescription('Norse Venture api documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
}
bootstrap();
