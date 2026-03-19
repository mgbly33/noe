import { drawCards } from '../draw.service';

describe('drawCards', () => {
  it('draws three unique cards without replacement', () => {
    const result = drawCards({
      spreadType: 'three_cards',
      reversedEnabled: true,
      seed: 'seed_1',
    });

    expect(new Set(result.cards.map((card) => card.cardId)).size).toBe(3);
  });
});
