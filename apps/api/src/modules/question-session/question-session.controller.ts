import { Body, Controller, Headers, Post } from '@nestjs/common';

import { QuestionSessionService } from './question-session.service';

@Controller('session')
export class QuestionSessionController {
  constructor(
    private readonly questionSessionService: QuestionSessionService,
  ) {}

  @Post('create')
  async createSession(
    @Headers('authorization') authorization: string | undefined,
    @Body()
    body: {
      topic_type: string;
      question_text: string;
      entry_channel: string;
    },
  ) {
    return {
      code: 0,
      data: await this.questionSessionService.createSession(
        authorization,
        body,
      ),
    };
  }
}
