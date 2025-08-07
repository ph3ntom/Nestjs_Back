import { Module } from '@nestjs/common';
import { RegisterController } from './register/register.controller';
import { LoginController } from './login/login.controller';
import { LoginService } from './login/login.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterService } from './register/register.service';
import { UserService } from '../sql/auth/auth';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [RegisterController, LoginController],
  providers: [LoginService, RegisterService, UserService],
})
export class AuthModule {}
