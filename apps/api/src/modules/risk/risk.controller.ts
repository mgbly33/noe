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
  async checkRisk(
    @Headers('authorization') authorization: string | undefined,
    @Body()
    body: {
      question_text: string;
      topic_type: string;
    },
  ) {
    const tokenPayload =
      this.authService.verifyAuthorizationHeader(authorization);
    const risk = this.riskService.evaluateQuestion(body.question_text);
    await this.riskService.recordQuestionRiskEvent({
      user_id: tokenPayload.user_id,
      question_text: body.question_text,
      risk_level: risk.risk_level,
      risk_tags: risk.risk_tags,
      scene: 'question_check',
    });

    return {
      code: 0,
      data: risk,
    };
  }
}
