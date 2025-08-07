// src/login/login.service.ts
import { Injectable } from '@nestjs/common';
import { LoginDto } from './login.dto/login.dto';
import { UserService } from '../../sql/auth/auth';

@Injectable()
export class LoginService {
    constructor(
        private readonly authService: UserService,
    ) {}

    async processLogin(loginDto: LoginDto): Promise<{ success: boolean, userId?: string }> {
        const { userId, password } = loginDto;

        const user = await this.authService.login(loginDto);

        if (user) {
            console.log(`User ${userId} authenticated successfully via database.`);
            return { success: true , userId: userId };
        } else {
            console.log(`Authentication failed for user ${userId}.`);
            return { success: false };
        }
    }
}
