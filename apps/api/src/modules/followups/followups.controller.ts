import { Body, Controller, Headers, Param, Post } from '@nestjs/common';

import { FollowupsService } from './followups.service';

@Controller('readings')
export class FollowupsController {
  constructor(private readonly followupsService: FollowupsService) {}

  @Post(':id/follow-up')
  async createFollowUp(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') readingId: string,
    @Body() body: { message: string },
  ) {
    return {
      code: 0,
      data: await this.followupsService.createFollowUp(
        authorization,
        readingId,
        body,
      ),
    };
  }
}
