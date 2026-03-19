import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body()
    body: {
      login_type: string;
      device_id?: string;
      channel?: string;
      login_name?: string;
      password?: string;
    },
  ) {
    return {
      code: 0,
      data: await this.authService.login(body),
    };
  }
}
