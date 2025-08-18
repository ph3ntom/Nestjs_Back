import { Controller, Post, Body, Req } from '@nestjs/common'; // Req 임포트 추가
import { LoginDto } from './login.dto/login.dto';
import { LoginService } from './login.service'; // LoginService 경로에 맞게 수정
import { Request } from 'express'; // Express Request 타입 임포트

@Controller('login')
export class LoginController {
  constructor(
    private readonly loginService: LoginService, // LoginService 주입
  ) {}

  @Post('/loginProcess')
  // @Req() 데코레이터를 사용하여 Request 객체를 주입받습니다.
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    console.log(`Login attempt for user: ${loginDto.userId}`);

    const result = await this.loginService.processLogin(loginDto);

    if (result.success) {
      req.session.userId = result.userId;
      req.session.mbrId = result.mbrId;

      console.log(
        `User ${result.userId} (mbrId: ${result.mbrId}) logged in. Session ID: ${req.session.id}`,
      );

      return {
        message: 'Login successful',
        userId: result.userId,
        mbrId: result.mbrId,
        sessionId: req.session.id,
        code: '0000',
      };
    } else {
      return {
        message: 'Invalid credentials',
        code: '9999',
      };
    }
  }

  // @Post('/check-login')
  // checkLoginStatus(@Req() req: Request) {
  //      if (req.session && req.session.userId) {
  //          return {
  //              isLoggedIn: true,
  //              userId: req.session.userId,
  //              message: 'User is logged in'
  //          };
  //      } else {
  //          return {
  //              isLoggedIn: false,
  //              message: 'User is not logged in'
  //          };
  //      }
  //  }
}
