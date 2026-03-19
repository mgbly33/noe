import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';

import { ReadingsService } from './readings.service';

@Controller('readings')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @Post('create')
  async createReading(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { session_id: string },
  ) {
    return {
      code: 0,
      data: await this.readingsService.createReading(authorization, body),
    };
  }

  @Post(':id/draw')
  async drawReading(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') readingId: string,
    @Body() body: { reversed_enabled: boolean },
  ) {
    return {
      code: 0,
      data: await this.readingsService.drawReading(
        authorization,
        readingId,
        body,
      ),
    };
  }

  @Post(':id/generate')
  async generateReading(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') readingId: string,
    @Body()
    body: {
      style: string;
      disclaimer_version: string;
    },
  ) {
    return {
      code: 0,
      data: await this.readingsService.generateReading(
        authorization,
        readingId,
        body,
      ),
    };
  }

  @Get(':id')
  async getReading(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') readingId: string,
  ) {
    return {
      code: 0,
      data: await this.readingsService.getReading(authorization, readingId),
    };
  }
}
