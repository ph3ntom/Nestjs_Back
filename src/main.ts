import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: 'phantom-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7200000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );

  app.useGlobalPipes(new ValidationPipe());

  // 글로벌 API prefix 설정
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://192.168.206.129:80',      // 프론트엔드 서버,
      'http://192.168.206.129:3000', // Next.js 개발 서버
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 모든 IP에서 접근 허용 (0.0.0.0)
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://192.168.60.138:${port}`);
}
bootstrap();
