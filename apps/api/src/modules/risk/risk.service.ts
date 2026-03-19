import { Injectable } from '@nestjs/common';

type RiskResult = {
  risk_level: 'LOW' | 'MEDIUM' | 'BLOCK';
  risk_tags: string[];
  action: 'pass' | 'downgrade' | 'redirect_support_page';
};

type PhraseRule = {
  phrases: readonly string[];
  result: RiskResult;
};

const BLOCK_RULES: readonly PhraseRule[] = [
  {
    phrases: [
      'i do not want to live anymore',
      "i don't want to live anymore",
      'want to die',
      'kill myself',
      'end my life',
      '\u4e0d\u60f3\u6d3b\u4e86',
      '\u60f3\u6b7b',
      '\u81ea\u6740',
    ],
    result: {
      risk_level: 'BLOCK',
      risk_tags: ['self_harm'],
      action: 'redirect_support_page',
    },
  },
];

const MEDIUM_RULES: readonly PhraseRule[] = [
  {
    phrases: [
      'medical advice',
      'take this medicine',
      '\u770b\u75c5',
      '\u5403\u4ec0\u4e48\u836f',
    ],
    result: {
      risk_level: 'MEDIUM',
      risk_tags: ['medical_advice'],
      action: 'downgrade',
    },
  },
];

@Injectable()
export class RiskService {
  evaluateQuestion(questionText: string): RiskResult {
    const normalizedText = questionText.trim().toLowerCase();

    for (const rule of BLOCK_RULES) {
      if (rule.phrases.some((phrase) => normalizedText.includes(phrase))) {
        return rule.result;
      }
    }

    for (const rule of MEDIUM_RULES) {
      if (rule.phrases.some((phrase) => normalizedText.includes(phrase))) {
        return rule.result;
      }
    }

    return {
      risk_level: 'LOW',
      risk_tags: [],
      action: 'pass',
    };
  }
}
