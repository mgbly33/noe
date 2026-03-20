import tarotDeckManifest from './rws1909-manifest.json';

type TarotDeckManifestCard = {
  id: string;
  name: string;
  imagePath: string;
  sourceUrl: string;
};

type TarotDeckManifest = {
  sourceSet: {
    deckSourceUrl: string;
    licenseName: string;
    licenseUrl: string;
  };
  generatedAt: string;
  cards: TarotDeckManifestCard[];
};

const manifest = tarotDeckManifest as TarotDeckManifest;

const cardArtIndex = new Map(
  manifest.cards.map((card) => [
    card.id,
    {
      src: card.imagePath,
      name: card.name,
      sourceUrl: card.sourceUrl,
    },
  ]),
);

export const tarotDeckSource = manifest.sourceSet;

export function getTarotCardArt(cardId: string) {
  return cardArtIndex.get(cardId) ?? null;
}
