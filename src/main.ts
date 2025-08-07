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

    app.enableCors({
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
        credentials: true, 
    });

    await app.listen(process.env.PORT || 3001);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
