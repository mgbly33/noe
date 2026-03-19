import { Injectable } from '@nestjs/common';

type StoredDrawCard = {
  card_id: string;
  card_name: string;
  position: number;
  orientation: string;
};

@Injectable()
export class MockAiProvider {
  generateReading(input: {
    questionText: string;
    style: string;
    cards: StoredDrawCard[];
    policyVersion: string;
    modelRouteCode: string | null;
  }) {
    if (input.style === 'force_fail') {
      throw new Error('Forced mock AI failure.');
    }

    const styleLabel =
      input.style === 'direct'
        ? '直接'
        : input.style === 'healing'
          ? '疗愈'
          : '温和';
    const cardSummary = input.cards
      .map(
        (card) =>
          `${card.card_name}${card.orientation === 'reversed' ? '（逆位）' : ''}`,
      )
      .join('、');

    return {
      structuredResult: {
        theme: `${styleLabel}聚焦当下问题的核心张力`,
        summary: `围绕“${input.questionText}”，牌面显示的主线是 ${cardSummary}。`,
        guidance: [
          `${input.cards[0]?.card_name ?? '第一张牌'}提示先看清现状。`,
          `${input.cards[1]?.card_name ?? '第二张牌'}提醒你辨认阻力来源。`,
          `${input.cards[2]?.card_name ?? '第三张牌'}给出下一步行动方向。`,
        ],
        cards: input.cards,
      },
      finalText: `你当前的问题是“${input.questionText}”。这次抽到 ${cardSummary}。建议先稳定节奏，再根据最关键的阻力做出一次小而确定的行动。`,
      modelVendor: 'mock',
      modelVersion: input.modelRouteCode ?? 'mock-provider-v1',
      promptVersion: input.policyVersion,
      policyVersion: input.policyVersion,
      safetyResult: 'PASS',
      latencyMs: 12,
      tokenInput: 180,
      tokenOutput: 220,
    };
  }
}
