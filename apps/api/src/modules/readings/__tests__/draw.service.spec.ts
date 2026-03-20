import { TAROT_DECK } from '../tarot-deck';
import { drawCards } from '../draw.service';

describe('drawCards', () => {
  it('defines the full 78-card tarot deck', () => {
    expect(TAROT_DECK).toHaveLength(78);
    expect(TAROT_DECK).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'major_00_fool', name: 'The Fool' }),
        expect.objectContaining({ id: 'cups_ace', name: 'Ace of Cups' }),
        expect.objectContaining({
          id: 'swords_queen',
          name: 'Queen of Swords',
        }),
        expect.objectContaining({
          id: 'pentacles_king',
          name: 'King of Pentacles',
        }),
      ]),
    );
  });

  it('draws three unique cards without replacement', () => {
    const result = drawCards({
      spreadType: 'three_cards',
      reversedEnabled: true,
      seed: 'seed_1',
    });

    expect(new Set(result.cards.map((card) => card.cardId)).size).toBe(3);
  });
});
