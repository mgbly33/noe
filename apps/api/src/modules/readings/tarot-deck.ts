export type TarotArcana = 'major' | 'minor';

export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles';

export type TarotRank =
  | 'ace'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'page'
  | 'knight'
  | 'queen'
  | 'king';

export type TarotCardDefinition = {
  id: string;
  name: string;
  arcana: TarotArcana;
  imagePath: `/images/tarot/rws1909/${string}.jpg`;
  sourceTitle: string;
  suit?: TarotSuit;
  rank?: TarotRank;
};

const MAJOR_ARCANA: TarotCardDefinition[] = [
  {
    id: 'major_00_fool',
    name: 'The Fool',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_00_fool.jpg',
    sourceTitle: 'RWS1909 - 00 Fool.jpeg',
  },
  {
    id: 'major_01_magician',
    name: 'The Magician',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_01_magician.jpg',
    sourceTitle: 'RWS1909 - 01 Magician.jpeg',
  },
  {
    id: 'major_02_high_priestess',
    name: 'The High Priestess',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_02_high_priestess.jpg',
    sourceTitle: 'RWS1909 - 02 High Priestess.jpeg',
  },
  {
    id: 'major_03_empress',
    name: 'The Empress',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_03_empress.jpg',
    sourceTitle: 'RWS1909 - 03 Empress.jpeg',
  },
  {
    id: 'major_04_emperor',
    name: 'The Emperor',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_04_emperor.jpg',
    sourceTitle: 'RWS1909 - 04 Emperor.jpeg',
  },
  {
    id: 'major_05_hierophant',
    name: 'The Hierophant',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_05_hierophant.jpg',
    sourceTitle: 'RWS1909 - 05 Hierophant.jpeg',
  },
  {
    id: 'major_06_lovers',
    name: 'The Lovers',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_06_lovers.jpg',
    sourceTitle: 'RWS1909 - 06 Lovers.jpeg',
  },
  {
    id: 'major_07_chariot',
    name: 'The Chariot',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_07_chariot.jpg',
    sourceTitle: 'RWS1909 - 07 Chariot.jpeg',
  },
  {
    id: 'major_08_strength',
    name: 'Strength',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_08_strength.jpg',
    sourceTitle: 'RWS1909 - 08 Strength.jpeg',
  },
  {
    id: 'major_09_hermit',
    name: 'The Hermit',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_09_hermit.jpg',
    sourceTitle: 'RWS1909 - 09 Hermit.jpeg',
  },
  {
    id: 'major_10_wheel_of_fortune',
    name: 'Wheel of Fortune',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_10_wheel_of_fortune.jpg',
    sourceTitle: 'RWS1909 - 10 Wheel of Fortune.jpeg',
  },
  {
    id: 'major_11_justice',
    name: 'Justice',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_11_justice.jpg',
    sourceTitle: 'RWS1909 - 11 Justice.jpeg',
  },
  {
    id: 'major_12_hanged_man',
    name: 'The Hanged Man',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_12_hanged_man.jpg',
    sourceTitle: 'RWS1909 - 12 Hanged Man.jpeg',
  },
  {
    id: 'major_13_death',
    name: 'Death',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_13_death.jpg',
    sourceTitle: 'RWS1909 - 13 Death.jpeg',
  },
  {
    id: 'major_14_temperance',
    name: 'Temperance',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_14_temperance.jpg',
    sourceTitle: 'RWS1909 - 14 Temperance.jpeg',
  },
  {
    id: 'major_15_devil',
    name: 'The Devil',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_15_devil.jpg',
    sourceTitle: 'RWS1909 - 15 Devil.jpeg',
  },
  {
    id: 'major_16_tower',
    name: 'The Tower',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_16_tower.jpg',
    sourceTitle: 'RWS1909 - 16 Tower.jpeg',
  },
  {
    id: 'major_17_star',
    name: 'The Star',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_17_star.jpg',
    sourceTitle: 'RWS1909 - 17 Star.jpeg',
  },
  {
    id: 'major_18_moon',
    name: 'The Moon',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_18_moon.jpg',
    sourceTitle: 'RWS1909 - 18 Moon.jpeg',
  },
  {
    id: 'major_19_sun',
    name: 'The Sun',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_19_sun.jpg',
    sourceTitle: 'RWS1909 - 19 Sun.jpeg',
  },
  {
    id: 'major_20_judgement',
    name: 'Judgement',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_20_judgement.jpg',
    sourceTitle: 'RWS1909 - 20 Judgement.jpeg',
  },
  {
    id: 'major_21_world',
    name: 'The World',
    arcana: 'major',
    imagePath: '/images/tarot/rws1909/major_21_world.jpg',
    sourceTitle: 'RWS1909 - 21 World.jpeg',
  },
];

const SUIT_LABELS: Record<TarotSuit, string> = {
  wands: 'Wands',
  cups: 'Cups',
  swords: 'Swords',
  pentacles: 'Pentacles',
};

const NUMBER_RANKS = [
  ['ace', 'Ace', '01'],
  ['2', 'Two', '02'],
  ['3', 'Three', '03'],
  ['4', 'Four', '04'],
  ['5', 'Five', '05'],
  ['6', 'Six', '06'],
  ['7', 'Seven', '07'],
  ['8', 'Eight', '08'],
  ['9', 'Nine', '09'],
  ['10', 'Ten', '10'],
] as const satisfies ReadonlyArray<
  readonly [TarotRank, string, `${number}${number}`]
>;

const COURT_RANKS = [
  ['page', 'Page', '11'],
  ['knight', 'Knight', '12'],
  ['queen', 'Queen', '13'],
  ['king', 'King', '14'],
] as const satisfies ReadonlyArray<
  readonly [
    Extract<TarotRank, 'page' | 'knight' | 'queen' | 'king'>,
    string,
    `${number}${number}`,
  ]
>;

const MINOR_ARCANA: TarotCardDefinition[] = (
  [
    'wands',
    'cups',
    'swords',
    'pentacles',
  ] as const satisfies readonly TarotSuit[]
).flatMap((suit) => {
  const suitLabel = SUIT_LABELS[suit];
  const numberedCards = NUMBER_RANKS.map<TarotCardDefinition>(
    ([rank, rankLabel, sourceIndex]) => ({
      id: `${suit}_${rank}`,
      name: `${rankLabel} of ${suitLabel}`,
      arcana: 'minor',
      suit,
      rank,
      imagePath: `/images/tarot/rws1909/${suit}_${rank}.jpg`,
      sourceTitle: `RWS1909 - ${suitLabel} ${sourceIndex}.jpeg`,
    }),
  );
  const courtCards = COURT_RANKS.map<TarotCardDefinition>(
    ([rank, rankLabel, sourceIndex]) => ({
      id: `${suit}_${rank}`,
      name: `${rankLabel} of ${suitLabel}`,
      arcana: 'minor',
      suit,
      rank,
      imagePath: `/images/tarot/rws1909/${suit}_${rank}.jpg`,
      sourceTitle: `RWS1909 - ${suitLabel} ${sourceIndex}.jpeg`,
    }),
  );

  return [...numberedCards, ...courtCards];
});

export const TAROT_DECK = [
  ...MAJOR_ARCANA,
  ...MINOR_ARCANA,
] as const satisfies readonly TarotCardDefinition[];
