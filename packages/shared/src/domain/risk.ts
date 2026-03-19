import { z } from 'zod';

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  BLOCK = 'BLOCK',
}

export enum RiskScene {
  INPUT = 'input',
  OUTPUT = 'output',
  BEHAVIOR = 'behavior',
  PAYMENT = 'payment',
}

export enum RiskTag {
  SELF_HARM = 'self_harm',
  EXTREME_DESPAIR = 'extreme_despair',
  MEDICAL_ADVICE = 'medical_advice',
  LEGAL_ADVICE = 'legal_advice',
  INVESTMENT_ADVICE = 'investment_advice',
  VIOLENCE = 'violence',
  FRAUD = 'fraud',
  ADDICTIVE_USAGE = 'addictive_usage',
  HIGH_FREQUENCY_REDRAW = 'high_frequency_redraw',
}

export enum RiskAction {
  PASS = 'pass',
  DOWNGRADE = 'downgrade',
  REWRITE = 'rewrite',
  BLOCK = 'block',
  REDIRECT_SUPPORT_PAGE = 'redirect_support_page',
  MANUAL_REVIEW = 'manual_review',
}

export const riskLevelSchema = z.nativeEnum(RiskLevel);
export const riskSceneSchema = z.nativeEnum(RiskScene);
export const riskTagSchema = z.nativeEnum(RiskTag);
export const riskActionSchema = z.nativeEnum(RiskAction);

export type RiskEvaluation = {
  level: RiskLevel;
  action: RiskAction;
  tags: RiskTag[];
};

type PhraseRule = {
  phrases: readonly string[];
  result: RiskEvaluation;
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
      level: RiskLevel.BLOCK,
      action: RiskAction.REDIRECT_SUPPORT_PAGE,
      tags: [RiskTag.SELF_HARM],
    },
  },
  {
    phrases: [
      'hurt someone',
      'kill them',
      '\u4f24\u5bb3\u522b\u4eba',
      '\u6740\u4e86\u4ed6',
    ],
    result: {
      level: RiskLevel.BLOCK,
      action: RiskAction.BLOCK,
      tags: [RiskTag.VIOLENCE],
    },
  },
];

const DOWNGRADE_RULES: readonly PhraseRule[] = [
  {
    phrases: [
      'medical advice',
      'take this medicine',
      '\u770b\u75c5',
      '\u5403\u4ec0\u4e48\u836f',
    ],
    result: {
      level: RiskLevel.MEDIUM,
      action: RiskAction.DOWNGRADE,
      tags: [RiskTag.MEDICAL_ADVICE],
    },
  },
  {
    phrases: [
      'legal advice',
      'how to sue',
      '\u6cd5\u5f8b\u610f\u89c1',
      '\u8d77\u8bc9',
    ],
    result: {
      level: RiskLevel.MEDIUM,
      action: RiskAction.DOWNGRADE,
      tags: [RiskTag.LEGAL_ADVICE],
    },
  },
  {
    phrases: [
      'which stock',
      'all in bitcoin',
      '\u6295\u8d44\u5efa\u8bae',
      '\u68ad\u54c8',
    ],
    result: {
      level: RiskLevel.MEDIUM,
      action: RiskAction.DOWNGRADE,
      tags: [RiskTag.INVESTMENT_ADVICE],
    },
  },
];

const matchRule = (questionText: string, rules: readonly PhraseRule[]) =>
  rules.find((rule) => rule.phrases.some((phrase) => questionText.includes(phrase)));

export const evaluateQuestionRisk = (questionText: string): RiskEvaluation => {
  const normalizedText = questionText.trim().toLowerCase();

  const blockRule = matchRule(normalizedText, BLOCK_RULES);
  if (blockRule) {
    return blockRule.result;
  }

  const downgradeRule = matchRule(normalizedText, DOWNGRADE_RULES);
  if (downgradeRule) {
    return downgradeRule.result;
  }

  return {
    level: RiskLevel.LOW,
    action: RiskAction.PASS,
    tags: [],
  };
};
