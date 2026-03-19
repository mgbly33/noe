import { Controller, Delete, Get, Headers, Param } from '@nestjs/common';

import { HistoryService } from './history.service';

@Controller('readings')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('history')
  async listHistory(
    @Headers('authorization') authorization: string | undefined,
  ) {
    return {
      code: 0,
      data: await this.historyService.listHistory(authorization),
    };
  }

  @Delete(':id')
  async archiveReading(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') readingId: string,
  ) {
    return {
      code: 0,
      data: await this.historyService.archiveReading(authorization, readingId),
    };
  }
}
