import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

import { loadEnv } from '../../common/load-env';

type StoredDrawCard = {
  card_id: string;
  card_name: string;
  position: number;
  orientation: string;
};

type PromptTemplate = {
  system?: string;
  interpretation_style?: string;
};

type ReadingGenerationInput = {
  questionText: string;
  style: string;
  cards: StoredDrawCard[];
  promptTemplate: unknown;
  policyVersion: string;
  modelRouteCode: string | null;
};

type FollowUpInput = {
  questionText: string;
  replyContext: string;
};

@Injectable()
export class OpenAiTarotProvider {
  private client: OpenAI | null = null;

  constructor() {
    loadEnv();
  }

  isConfigured() {
    return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL);
  }

  async generateReading(input: ReadingGenerationInput) {
    const startedAt = Date.now();
    const response = await this.getClient().responses.create({
      model: this.getModel(),
      reasoning: {
        effort: this.getReasoningEffort(),
      },
      instructions: this.buildReadingInstructions(input.promptTemplate),
      input: this.buildReadingInput(input),
    });
    const parsed = this.parseJsonObject<{
      theme?: string;
      summary?: string;
      guidance?: string[];
      final_text?: string;
    }>(response.output_text ?? '');

    return {
      structuredResult: {
        theme: parsed.theme?.trim() || '围绕当前问题整理出一个清晰主题',
        summary:
          parsed.summary?.trim() ||
          `围绕“${input.questionText}”，牌面给出的重点需要你重新梳理。`,
        guidance: this.normalizeGuidance(parsed.guidance),
        cards: input.cards,
      },
      finalText:
        parsed.final_text?.trim() ||
        `围绕“${input.questionText}”，请先稳定节奏，再做下一步判断。`,
      modelVendor: 'openai',
      modelVersion: this.getModel(),
      promptVersion: input.policyVersion,
      policyVersion: input.policyVersion,
      safetyResult: 'PASS',
      latencyMs: Date.now() - startedAt,
      tokenInput: response.usage?.input_tokens ?? 0,
      tokenOutput: response.usage?.output_tokens ?? 0,
    };
  }

  async generateFollowUp(input: FollowUpInput) {
    const response = await this.getClient().responses.create({
      model: this.getModel(),
      reasoning: {
        effort: this.getReasoningEffort(),
      },
      instructions:
        'You are a calm tarot guide. Return only JSON with one key: reply. Keep the tone grounded, specific, and gentle. Do not mention being an AI model.',
      input: this.buildFollowUpInput(input),
    });
    const parsed = this.parseJsonObject<{ reply?: string }>(
      response.output_text ?? '',
    );

    return {
      reply:
        parsed.reply?.trim() ||
        '先别急着追求结果，先回到你真正害怕失去和真正想守住的那部分。',
      modelVendor: 'openai',
      modelVersion: this.getModel(),
    };
  }

  private getClient() {
    if (this.client) {
      return this.client;
    }

    if (!this.isConfigured()) {
      throw new Error('OpenAI provider is not configured.');
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: this.normalizeBaseUrl(process.env.OPENAI_BASE_URL),
    });

    return this.client;
  }

  private getModel() {
    return process.env.OPENAI_MODEL ?? 'gpt-5.4';
  }

  private getReasoningEffort() {
    const value = process.env.OPENAI_REASONING_EFFORT;

    if (value === 'low' || value === 'medium' || value === 'high') {
      return value;
    }

    return 'medium';
  }

  private normalizeBaseUrl(rawBaseUrl: string | undefined) {
    if (!rawBaseUrl?.trim()) {
      return 'https://api.openai.com/v1';
    }

    const url = new URL(rawBaseUrl);

    if (url.pathname === '' || url.pathname === '/') {
      url.pathname = '/v1';
    }

    return url.toString().replace(/\/$/, '');
  }

  private buildReadingInstructions(templateValue: unknown) {
    const promptTemplate = this.readPromptTemplate(templateValue);
    const systemPrompt = promptTemplate.system ?? 'You are a calm tarot guide.';
    const interpretationStyle =
      promptTemplate.interpretation_style ?? 'gentle and practical';

    return [
      systemPrompt,
      `Interpretation style: ${interpretationStyle}.`,
      'Return only valid JSON.',
      'Required keys: theme, summary, guidance, final_text.',
      'guidance must be an array of exactly 3 short strings.',
      'Do not include markdown fences.',
    ].join(' ');
  }

  private buildReadingInput(input: ReadingGenerationInput) {
    const styleMap: Record<string, string> = {
      direct: '直接',
      healing: '疗愈',
      gentle: '温和',
    };

    return JSON.stringify(
      {
        question_text: input.questionText,
        style: styleMap[input.style] ?? input.style,
        model_route_code: input.modelRouteCode,
        cards: input.cards,
      },
      null,
      2,
    );
  }

  private buildFollowUpInput(input: FollowUpInput) {
    return JSON.stringify(
      {
        follow_up_question: input.questionText,
        current_reading_context: input.replyContext,
      },
      null,
      2,
    );
  }

  private readPromptTemplate(value: unknown): PromptTemplate {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    const record = value as Record<string, unknown>;

    return {
      system: typeof record.system === 'string' ? record.system : undefined,
      interpretation_style:
        typeof record.interpretation_style === 'string'
          ? record.interpretation_style
          : undefined,
    };
  }

  private normalizeGuidance(guidance: string[] | undefined) {
    const normalized = (guidance ?? [])
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (normalized.length === 3) {
      return normalized;
    }

    return [
      '先看清现状里最反复出现的情绪。',
      '辨认真正阻碍你前进的那部分。',
      '只做一步小而确定的行动验证方向。',
    ];
  }

  private parseJsonObject<T>(rawText: string) {
    const trimmed = rawText.trim();
    const unfenced = trimmed
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
    const jsonStart = unfenced.indexOf('{');
    const jsonEnd = unfenced.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
      throw new Error('OpenAI response did not contain a JSON object.');
    }

    return JSON.parse(unfenced.slice(jsonStart, jsonEnd + 1)) as T;
  }
}
