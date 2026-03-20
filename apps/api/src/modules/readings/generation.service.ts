import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DrawResult, Reading } from '@prisma/client';

import { OpenAiTarotProvider } from '../ai/openai-tarot.provider';
import { MockAiProvider } from './providers/mock-ai.provider';
import { PromptPolicyProvider } from './providers/prompt-policy.provider';

type StoredDrawCard = {
  card_id: string;
  card_name: string;
  position: number;
  orientation: string;
};

@Injectable()
export class GenerationService {
  constructor(
    private readonly promptPolicyProvider: PromptPolicyProvider,
    private readonly openAiTarotProvider: OpenAiTarotProvider,
    private readonly mockAiProvider: MockAiProvider,
  ) {}

  async generateReading(input: {
    reading: Reading;
    draw: DrawResult;
    style: string;
    disclaimerVersion: string;
  }) {
    const cards = this.parseCards(input.draw.cards_json);
    const activePolicy = await this.promptPolicyProvider.getActivePolicy();
    const generated = this.shouldUseOpenAi()
      ? await this.openAiTarotProvider.generateReading({
          questionText: input.reading.question_text,
          style: input.style,
          cards,
          promptTemplate: activePolicy.prompt_template,
          policyVersion: activePolicy.policy_version,
          modelRouteCode: activePolicy.model_route_code,
        })
      : this.mockAiProvider.generateReading({
          questionText: input.reading.question_text,
          style: input.style,
          cards,
          policyVersion: activePolicy.policy_version,
          modelRouteCode: activePolicy.model_route_code,
        });

    if (
      !generated.structuredResult.theme ||
      typeof generated.finalText !== 'string' ||
      generated.finalText.trim().length === 0
    ) {
      return {
        ...generated,
        structuredResult: {
          ...generated.structuredResult,
          theme:
            generated.structuredResult.theme ??
            '围绕当前问题整理出一个清晰主题',
        },
        finalText:
          generated.finalText ||
          `围绕“${input.reading.question_text}”，请先稳定节奏，再做下一步判断。`,
      };
    }

    if (this.isUnsafe(generated.finalText)) {
      throw new InternalServerErrorException(
        'Generated output failed the safety check.',
      );
    }

    return generated;
  }

  private parseCards(cardsJson: DrawResult['cards_json']) {
    if (!Array.isArray(cardsJson)) {
      throw new InternalServerErrorException('Stored draw cards are invalid.');
    }

    return cardsJson as StoredDrawCard[];
  }

  private isUnsafe(finalText: string) {
    const blockedTerms = ['self-harm', 'hurt yourself'];
    const normalized = finalText.toLowerCase();

    return blockedTerms.some((term) => normalized.includes(term));
  }

  private shouldUseOpenAi() {
    return (
      process.env.NODE_ENV !== 'test' && this.openAiTarotProvider.isConfigured()
    );
  }
}
