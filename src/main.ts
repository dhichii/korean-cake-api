import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use(cookieParser());

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  const documentConfig = new DocumentBuilder()
    .setTitle('Korean Cake')
    .setDescription('The Korean Cake API Documentation')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        description: `Please enter token in following format: YOUR_TOKEN`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'Authorization',
    )
    .addCookieAuth('refresh')
    .build();

  const document = SwaggerModule.createDocument(app, documentConfig);

  SwaggerModule.setup('docs', app, document);

  console.log(document.paths['/api/v1/admin'].get.parameters);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
