import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmetImport from 'helmet';
import cookieParser from 'cookie-parser';
import { ValidationPipe, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const port = process.env.API_PORT || 3000;

  app.use(helmetImport.default ? helmetImport.default() : (helmetImport as any)());
  app.use(cookieParser());
  
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // In production, validate against trusted domains
      if (!origin) return callback(null, true);
      
      const allowedLocal = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
      const baseDomain = process.env.TENANT_BASE_DOMAIN || 'sitehookz.com';
      
      const isAllowedLocal = process.env.NODE_ENV !== 'production' && allowedLocal.includes(origin);
      const isAllowedProd = origin === `https://${baseDomain}` || origin.endsWith(`.${baseDomain}`);
      
      if (isAllowedLocal || isAllowedProd) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  // Request ID middleware
  app.use(new RequestIdMiddleware().use);

  app.useGlobalFilters(new GlobalExceptionFilter());
  
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
