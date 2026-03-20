# 2026-03-20 Public Domain Tarot Deck Integration Design

## Status

Approved in chat for implementation.

## Scope

This pass replaces the current text-only tarot card presentation with a complete public-domain Rider-Waite-Smith card image set that is stored locally in the project and rendered directly in the reading result UI.

In scope:

- use a public-domain commercial-use-safe tarot image source
- download and normalize a complete 78-card deck into local web assets
- expand the runtime deck definition from 22 major arcana cards to the full 78-card deck
- add a stable `card_id -> image_path` mapping
- render tarot card images in the reading result UI
- keep download provenance and license traceability in the repository
- add focused verification for deck size, asset completeness, and UI rendering

Out of scope:

- generating new tarot artwork with OpenAI
- changing payment, reading, follow-up, or account workflows
- changing database schema
- changing the interpretation response shape
- introducing runtime external image dependencies

## Problem Statement

The project currently has two mismatches:

1. the runtime draw deck only contains 22 major arcana cards
2. the reading result page only shows card text, not card images

At the same time, the project already has a tarot-first presentation style and would benefit from full card imagery. The user explicitly rejected custom generated card art and chose to use a public-domain deck that is safe for commercial use.

## Chosen Source

Use the Wikimedia Commons public-domain Rider-Waite-Smith 1909 “Roses & Lilies” set as the canonical source.

Primary source:

- <https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck_(Roses_%26_Lilies)>

Representative file page:

- <https://commons.wikimedia.org/wiki/File:RWS1909_-_00_Fool.jpeg>

Why this source:

- strong user recognition relative to other tarot decks
- explicit public-domain labeling on Commons
- visually aligned with the site’s current sacred/classic tarot direction
- practical to normalize into a complete local asset pack

Guardrail:

- only use the approved Roses & Lilies set
- do not mix later recolors or derivative decks from other categories

## Goals

1. The project should be able to draw from a full 78-card tarot deck.
2. Every runtime `card_id` should have a matching local image file.
3. The reading result page should render tarot imagery without external network dependency.
4. The asset pipeline should be repeatable and auditable.
5. Existing business APIs and persistence contracts should remain stable.

## Architecture

### 1. Canonical deck definition

Introduce a single canonical deck definition that describes all 78 cards.

Each record should include:

- `card_id`
- `card_name`
- `arcana`
- `suit` when applicable
- `rank` when applicable
- `image_path`

The draw algorithm should use this deck definition rather than the current inline 22-card constant.

### 2. Stable naming contract

Use deterministic filenames that match the runtime card identifiers.

Examples:

- `major_00_fool.jpg`
- `major_17_star.jpg`
- `wands_ace.jpg`
- `cups_queen.jpg`
- `swords_10.jpg`
- `pentacles_king.jpg`

The filename contract should be the same everywhere:

- deck definition
- downloader output
- frontend image mapping
- verification scripts

### 3. Local asset storage

Store the normalized images under the web app public asset tree so Next.js can serve them directly.

Recommended structure:

- `apps/web/public/images/tarot/rws1909/`

This keeps the assets versioned, cacheable, and independent from third-party runtime availability.

### 4. Download and normalization script

Add a command-line script that:

- downloads the approved card files from the source set
- writes normalized files using the runtime filename contract
- records provenance and license metadata in a manifest
- can be safely re-run without duplicating already-correct files

The script should fail loudly if:

- the file count is not 78
- a mapped source URL is missing
- a target file fails to download

### 5. Result-page rendering

Update the reading result card grid so each card shows:

- tarot card image
- localized card title or canonical name
- position
- orientation

The visual treatment should preserve the current sacred editorial tone:

- vertical tarot-card ratio
- clean spacing
- no stretched thumbnails
- mobile-safe stacking

### 6. Fallback behavior

If an image is missing in development, the UI should render a graceful placeholder card rather than breaking layout.

This fallback is defensive only. The intended steady state is 78/78 complete.

## Backend Changes

### Draw deck expansion

Expand the deck used by the draw service from 22 to 78 cards.

Important compatibility rule:

- existing major arcana `card_id` values must remain unchanged

This avoids breaking:

- existing stored draw records
- result-page rendering for previously generated readings
- future image mapping consistency

### API shape

Do not change the draw API shape.

Existing output remains:

- `card_id`
- `card_name`
- `position`
- `orientation`

Image lookup stays a frontend concern based on stable `card_id`.

## Frontend Changes

### Reading result UI

Update the reading result component to render real card art in the draw grid.

Display order:

1. image
2. position label
3. card name
4. upright/reversed state

### Styling

The draw grid should be upgraded from simple text cards to tarot-card panels with:

- fixed aspect ratio
- overflow-safe image frame
- non-distorted image scaling
- compact metadata below or overlaid in a controlled way

### Future-proofing

Keep the image lookup logic isolated so a future deck swap only requires:

- replacing assets
- updating the manifest/mapping

without rewriting the page structure.

## Provenance and Licensing

Add a repository-local provenance record that captures:

- canonical deck source URL
- per-card source URL when practical
- public-domain note
- download timestamp or script regeneration timestamp

This is required for auditability and later commercial packaging.

## Verification Plan

Before the work is complete, verify all of the following:

1. Deck definition contains exactly 78 cards.
2. Downloaded asset directory contains exactly 78 expected image files.
3. Provenance/manifest file contains exactly 78 mapped records.
4. Draw logic still returns unique cards without replacement.
5. Web typecheck/build still pass.
6. Reading result page renders card images correctly in the browser.

## Risks and Mitigations

### Risk: Commons file naming irregularities

Mitigation:

- encode explicit source mappings in the downloader instead of scraping loosely by title

### Risk: deck mismatch between runtime IDs and filenames

Mitigation:

- make `card_id` the single source of truth for output filenames

### Risk: future asset churn

Mitigation:

- isolate download logic and manifest generation from the UI rendering layer

### Risk: mobile layout breakage due to tall card art

Mitigation:

- use fixed aspect ratio and existing responsive grid breakpoints

## Approval Record

Approved in chat:

- use public-domain commercially safe images
- use the direct-download path rather than generated artwork
- use the full 78-card deck rather than only 22 major arcana
- proceed with the local-asset integration approach
