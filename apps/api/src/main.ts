import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('API_PORT', 4000);
  const apiPrefix = config.get<string>('API_PREFIX', 'api');

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: config.get('APP_URL', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // API Versioning
  app.enableVersioning({ type: VersioningType.URI });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger Documentation
  if (config.get('SWAGGER_ENABLED') !== 'false') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('NsProject API')
      .setDescription('Enterprise Project Management System API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication')
      .addTag('projects', 'Project Management')
      .addTag('tasks', 'Task Management')
      .addTag('resources', 'Resource Management')
      .addTag('crm', 'CRM')
      .addTag('workflows', 'Workflow Automation')
      .addTag('notifications', 'Notifications')
      .addTag('reports', 'Reporting & Analytics')
      .addTag('admin', 'Admin Panel')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger docs:   http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
