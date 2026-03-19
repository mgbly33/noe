import { Body, Controller, Headers, Post } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { RiskService } from './risk.service';

@Controller('question')
export class RiskController {
  constructor(
    private readonly authService: AuthService,
    private readonly riskService: RiskService,
  ) {}

  @Post('check-risk')
  checkRisk(
    @Headers('authorization') authorization: string | undefined,
    @Body()
    body: {
      question_text: string;
      topic_type: string;
    },
  ) {
    this.authService.verifyAuthorizationHeader(authorization);

    return {
      code: 0,
      data: this.riskService.evaluateQuestion(body.question_text),
    };
  }
}
