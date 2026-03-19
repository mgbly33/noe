import { Controller, Get, Headers } from '@nestjs/common';

import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('balance')
  async getBalance(
    @Headers('authorization') authorization: string | undefined,
  ) {
    return {
      code: 0,
      data: await this.assetsService.getBalance(authorization),
    };
  }
}
