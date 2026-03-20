import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TAROT_DECK,
  type TarotCardDefinition,
} from '../apps/api/src/modules/readings/tarot-deck';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const outputDir = resolve(projectRoot, 'apps/web/public/images/tarot/rws1909');
const manifestDir = resolve(projectRoot, 'apps/web/src/lib/tarot');
const manifestPath = resolve(manifestDir, 'rws1909-manifest.json');

const DECK_SOURCE_URL =
  'https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck_(Roses_%26_Lilies)';
const COMMONS_FILE_PAGE_BASE = 'https://commons.wikimedia.org/wiki/File:';
const COMMONS_API_BASE = 'https://commons.wikimedia.org/w/api.php';
const LICENSE_NAME = 'Public domain';
const LICENSE_URL =
  'https://creativecommons.org/publicdomain/mark/1.0/';
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 6;
const TITLE_BATCH_SIZE = 25;

type TarotDeckManifest = {
  sourceSet: {
    deckSourceUrl: string;
    licenseName: string;
    licenseUrl: string;
  };
  generatedAt: string;
  cards: Array<
    TarotCardDefinition & {
      imagePath: `/images/tarot/rws1909/${string}.jpg`;
      sourceUrl: string;
      downloadUrl: string;
    }
  >;
};

const buildSourcePageUrl = (sourceTitle: string) =>
  `${COMMONS_FILE_PAGE_BASE}${encodeURIComponent(sourceTitle)}`;

const sleep = (ms: number) =>
  new Promise((resolvePromise) => {
    setTimeout(resolvePromise, ms);
  });

async function fetchWithRetry(url: string, cardId: string) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'ai-tarot-mvp/1.0 (public-domain deck downloader)',
      },
    });

    if (response.ok) {
      return response;
    }

    if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === MAX_ATTEMPTS) {
      throw new Error(
        `Failed to download ${cardId}: ${response.status} ${response.statusText}`,
      );
    }

    const retryAfterHeader = response.headers.get('retry-after');
    const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
    const backoffMs = Number.isFinite(retryAfterSeconds)
      ? retryAfterSeconds * 1000
      : attempt * 1500;

    await sleep(backoffMs);
  }

  throw new Error(`Retry loop exhausted for ${cardId}.`);
}

async function resolveDownloadUrls(cards: readonly TarotCardDefinition[]) {
  const urlBySourceTitle = new Map<string, string>();

  for (let index = 0; index < cards.length; index += TITLE_BATCH_SIZE) {
    const titleParam = cards
      .slice(index, index + TITLE_BATCH_SIZE)
      .map((card) => `File:${card.sourceTitle}`)
      .join('|');
    const apiUrl = new URL(COMMONS_API_BASE);

    apiUrl.searchParams.set('action', 'query');
    apiUrl.searchParams.set('format', 'json');
    apiUrl.searchParams.set('formatversion', '2');
    apiUrl.searchParams.set('prop', 'imageinfo');
    apiUrl.searchParams.set('iiprop', 'url');
    apiUrl.searchParams.set('titles', titleParam);

    const response = await fetchWithRetry(apiUrl.toString(), 'commons-imageinfo');
    const payload = (await response.json()) as {
      query?: {
        pages?: Array<{
          title?: string;
          imageinfo?: Array<{ url?: string }>;
        }>;
      };
    };

    const entries = payload.query?.pages ?? [];

    for (const entry of entries) {
      if (!entry.title || !entry.imageinfo?.[0]?.url) {
        continue;
      }

      const sourceTitle = entry.title.replace(/^File:/, '');
      urlBySourceTitle.set(sourceTitle, entry.imageinfo[0].url);
    }
  }

  return urlBySourceTitle;
}

async function downloadCardImage(
  card: TarotCardDefinition,
  downloadUrlBySourceTitle: ReadonlyMap<string, string>,
) {
  const outputPath = resolve(outputDir, `${card.id}.jpg`);

  try {
    const current = await stat(outputPath);

    if (current.size > 0) {
      return;
    }
  } catch {
    // file missing, continue to download
  }

  const downloadUrl = downloadUrlBySourceTitle.get(card.sourceTitle);

  if (!downloadUrl) {
    throw new Error(`No download URL resolved for ${card.id}.`);
  }

  const response = await fetchWithRetry(downloadUrl, card.id);

  const body = Buffer.from(await response.arrayBuffer());

  if (!body.length) {
    throw new Error(`Downloaded empty image payload for ${card.id}.`);
  }

  await writeFile(outputPath, body);
}

async function verifyOutput(manifest: TarotDeckManifest) {
  if (manifest.cards.length !== 78) {
    throw new Error(`Expected 78 manifest entries, received ${manifest.cards.length}.`);
  }

  const files = (await readdir(outputDir)).filter((entry) => entry.endsWith('.jpg'));

  if (files.length !== 78) {
    throw new Error(`Expected 78 downloaded jpg files, found ${files.length}.`);
  }

  for (const card of manifest.cards) {
    const filePath = resolve(outputDir, `${card.id}.jpg`);
    const fileStats = await stat(filePath);

    if (fileStats.size <= 0) {
      throw new Error(`Image file for ${card.id} is empty.`);
    }
  }
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  await mkdir(manifestDir, { recursive: true });
  const downloadUrlBySourceTitle = await resolveDownloadUrls(TAROT_DECK);

  for (const card of TAROT_DECK) {
    await downloadCardImage(card, downloadUrlBySourceTitle);
  }

  const manifest: TarotDeckManifest = {
    sourceSet: {
      deckSourceUrl: DECK_SOURCE_URL,
      licenseName: LICENSE_NAME,
      licenseUrl: LICENSE_URL,
    },
    generatedAt: new Date().toISOString(),
    cards: TAROT_DECK.map((card) => ({
      ...card,
      sourceUrl: buildSourcePageUrl(card.sourceTitle),
      downloadUrl:
        downloadUrlBySourceTitle.get(card.sourceTitle) ??
        buildSourcePageUrl(card.sourceTitle),
    })),
  };

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await verifyOutput(manifest);

  console.log(
    JSON.stringify(
      {
        downloaded: manifest.cards.length,
        outputDir,
        manifestPath,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
