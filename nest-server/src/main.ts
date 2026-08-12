import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseFormatInterceptor } from './common/interceptors/response-format/response-format.interceptor';
import { GlobalExceptionFilter } from './common/error-handling/global-exception-filter';
import { ValidationPipe } from '@nestjs/common';
import multer from 'multer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('DEMO DOCS')
    .setDescription('The API docs')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  app.use(multer().none());
  app.setGlobalPrefix("api");
  app.enableCors();
  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

