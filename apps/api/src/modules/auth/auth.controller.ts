import { Body, Controller, Get, Headers, Post } from '@nestjs/common';

import { AuthService } from './auth.service';

type AuthBody = {
  login_type: string;
  device_id?: string;
  channel?: string;
  login_name?: string;
  password?: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: AuthBody) {
    return {
      code: 0,
      data: await this.authService.register(body),
    };
  }

  @Post('login')
  async login(@Body() body: AuthBody) {
    return {
      code: 0,
      data: await this.authService.login(body),
    };
  }

  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    return {
      code: 0,
      data: await this.authService.me(authorization),
    };
  }
}
