import { Body, Controller, Get, Headers, Post } from '@nestjs/common';

import { ConsentService } from './consent.service';

@Controller('consent')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Get('latest')
  async getLatest() {
    return {
      code: 0,
      data: await this.consentService.getLatest(),
    };
  }

  @Post('accept')
  async accept(
    @Headers('authorization') authorization: string | undefined,
    @Body()
    body: {
      privacy_version: string;
      disclaimer_version: string;
      ai_notice_version: string;
      age_notice_version: string;
      accepted: boolean;
    },
  ) {
    return {
      code: 0,
      data: await this.consentService.accept(authorization, body),
    };
  }
}
