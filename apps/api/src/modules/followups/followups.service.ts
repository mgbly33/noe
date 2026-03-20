import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { createBusinessId } from '../../common/id';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenAiTarotProvider } from '../ai/openai-tarot.provider';
import { AuthService } from '../auth/auth.service';
import { RiskService } from '../risk/risk.service';

@Injectable()
export class FollowupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly riskService: RiskService,
    private readonly openAiTarotProvider: OpenAiTarotProvider,
  ) {}

  async createFollowUp(
    authorization: string | undefined,
    readingId: string,
    body: { message: string },
  ) {
    const tokenPayload =
      this.authService.verifyAuthorizationHeader(authorization);
    await this.authService.assertUserHasLatestConsent(tokenPayload.user_id);

    const reading = await this.prisma.reading.findFirst({
      where: {
        reading_id: readingId,
        user_id: tokenPayload.user_id,
      },
    });
    if (!reading) {
      throw new NotFoundException('Reading does not exist.');
    }
    if (!['READY', 'FOLLOW_UP'].includes(reading.reading_status)) {
      throw new BadRequestException('Reading is not available for follow-up.');
    }

    const risk = this.riskService.evaluateQuestion(body.message);
    const interpretation = await this.prisma.interpretation.findFirst({
      where: {
        reading_id: reading.reading_id,
      },
    });
    await this.riskService.recordQuestionRiskEvent({
      user_id: tokenPayload.user_id,
      question_text: body.message,
      risk_level: risk.risk_level,
      risk_tags: risk.risk_tags,
      scene: 'follow_up',
      reading_id: reading.reading_id,
    });

    const followUpResult =
      risk.risk_level === 'BLOCK'
        ? {
            reply: '这个追问触发了高风险保护，请先寻求线下专业支持。',
            modelVendor: 'mock',
            modelVersion: 'mock-followup-v1',
          }
        : await this.generateFollowUpReply({
            questionText: body.message,
            replyContext:
              interpretation?.final_text ?? `原问题：${reading.question_text}`,
          });

    await this.prisma.$transaction(async (tx) => {
      await tx.followupMessage.create({
        data: {
          message_id: createBusinessId('msg'),
          reading_id: reading.reading_id,
          role: 'user',
          content: body.message,
          risk_flag: risk.risk_level === 'LOW' ? null : risk.risk_level,
        },
      });
      await tx.followupMessage.create({
        data: {
          message_id: createBusinessId('msg'),
          reading_id: reading.reading_id,
          role: 'assistant',
          content: followUpResult.reply,
          risk_flag: risk.risk_level === 'LOW' ? null : risk.risk_level,
          model_vendor: followUpResult.modelVendor,
          model_version: followUpResult.modelVersion,
        },
      });
      await tx.reading.update({
        where: {
          id: reading.id,
        },
        data: {
          reading_status: 'FOLLOW_UP',
        },
      });
    });

    return {
      reading_id: reading.reading_id,
      reply: followUpResult.reply,
      risk_level: risk.risk_level,
    };
  }

  private async generateFollowUpReply(input: {
    questionText: string;
    replyContext: string;
  }) {
    if (
      process.env.NODE_ENV === 'test' ||
      !this.openAiTarotProvider.isConfigured()
    ) {
      return {
        reply: `围绕这次牌面，如果你选择“${input.questionText}”这条路径，建议先观察最直接的阻力，再做一步小而确定的尝试。`,
        modelVendor: 'mock',
        modelVersion: 'mock-followup-v1',
      };
    }

    return this.openAiTarotProvider.generateFollowUp(input);
  }
}
