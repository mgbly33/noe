import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

import { TAROT_DECK } from './tarot-deck';

type SpreadType = 'one_card' | 'three_cards';
type CardOrientation = 'upright' | 'reversed';

export type DrawCard = {
  cardId: string;
  cardName: string;
  position: number;
  orientation: CardOrientation;
};

const getCardCount = (spreadType: SpreadType) =>
  spreadType === 'one_card' ? 1 : 3;

const getScore = (seed: string) =>
  createHash('sha256').update(seed).digest('hex');

export const drawCards = ({
  spreadType,
  reversedEnabled,
  seed,
}: {
  spreadType: SpreadType;
  reversedEnabled: boolean;
  seed: string;
}) => {
  const cards = [...TAROT_DECK]
    .sort((left, right) => {
      const leftScore = getScore(`${seed}:${left.id}`);
      const rightScore = getScore(`${seed}:${right.id}`);

      if (leftScore === rightScore) {
        return left.id.localeCompare(right.id);
      }

      return leftScore.localeCompare(rightScore);
    })
    .slice(0, getCardCount(spreadType))
    .map<DrawCard>((card, index) => ({
      cardId: card.id,
      cardName: card.name,
      position: index + 1,
      orientation:
        reversedEnabled &&
        getScore(`${seed}:${card.id}:orientation`).endsWith('0')
          ? 'reversed'
          : 'upright',
    }));

  return {
    cards,
    signature: getScore(
      `${seed}:${cards.map((card) => card.cardId).join('|')}:${reversedEnabled}`,
    ),
  };
};

@Injectable()
export class DrawService {
  createDraw(params: {
    spreadType: SpreadType;
    reversedEnabled: boolean;
    seed: string;
  }) {
    return drawCards(params);
  }
}
