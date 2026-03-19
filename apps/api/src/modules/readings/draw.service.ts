import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

type SpreadType = 'one_card' | 'three_cards';
type CardOrientation = 'upright' | 'reversed';

export type DrawCard = {
  cardId: string;
  cardName: string;
  position: number;
  orientation: CardOrientation;
};

const TAROT_DECK = [
  { id: 'major_00_fool', name: 'The Fool' },
  { id: 'major_01_magician', name: 'The Magician' },
  { id: 'major_02_high_priestess', name: 'The High Priestess' },
  { id: 'major_03_empress', name: 'The Empress' },
  { id: 'major_04_emperor', name: 'The Emperor' },
  { id: 'major_05_hierophant', name: 'The Hierophant' },
  { id: 'major_06_lovers', name: 'The Lovers' },
  { id: 'major_07_chariot', name: 'The Chariot' },
  { id: 'major_08_strength', name: 'Strength' },
  { id: 'major_09_hermit', name: 'The Hermit' },
  { id: 'major_10_wheel_of_fortune', name: 'Wheel of Fortune' },
  { id: 'major_11_justice', name: 'Justice' },
  { id: 'major_12_hanged_man', name: 'The Hanged Man' },
  { id: 'major_13_death', name: 'Death' },
  { id: 'major_14_temperance', name: 'Temperance' },
  { id: 'major_15_devil', name: 'The Devil' },
  { id: 'major_16_tower', name: 'The Tower' },
  { id: 'major_17_star', name: 'The Star' },
  { id: 'major_18_moon', name: 'The Moon' },
  { id: 'major_19_sun', name: 'The Sun' },
  { id: 'major_20_judgement', name: 'Judgement' },
  { id: 'major_21_world', name: 'The World' },
] as const;

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
