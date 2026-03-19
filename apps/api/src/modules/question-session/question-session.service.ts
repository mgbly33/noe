import { Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CatalogService } from '../catalog/catalog.service';
import { RiskService } from '../risk/risk.service';

@Injectable()
export class QuestionSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly riskService: RiskService,
    private readonly catalogService: CatalogService,
  ) {}

  async createSession(
    authorization: string | undefined,
    body: {
      topic_type: string;
      question_text: string;
      entry_channel: string;
    },
  ) {
    const tokenPayload =
      this.authService.verifyAuthorizationHeader(authorization);
    await this.authService.assertUserHasLatestConsent(tokenPayload.user_id);

    const risk = this.riskService.evaluateQuestion(body.question_text);
    const sessionId = `qs_${randomUUID().replace(/-/g, '')}`;
    const recommendedSkus = await this.selectRecommendedSkus(body.topic_type);

    await this.prisma.questionSession.create({
      data: {
        session_id: sessionId,
        user_id: tokenPayload.user_id,
        topic_type: body.topic_type,
        question_text: body.question_text,
        question_hash: createHash('sha256')
          .update(body.question_text.trim().toLowerCase())
          .digest('hex'),
        risk_level: risk.risk_level,
        risk_tags: risk.risk_tags,
        entry_channel: body.entry_channel,
        status: risk.risk_level === 'BLOCK' ? 'blocked' : 'created',
      },
    });

    return {
      session_id: sessionId,
      risk_level: risk.risk_level,
      recommended_skus: recommendedSkus,
    };
  }

  private async selectRecommendedSkus(topicType: string) {
    const products = await this.catalogService.listProducts();
    const activeSkus = products.items.map((item) => item.sku_id);

    if (topicType === 'career' || topicType === 'emotion') {
      return activeSkus.filter((skuId) => skuId.includes('three_cards'));
    }

    return activeSkus;
  }
}
