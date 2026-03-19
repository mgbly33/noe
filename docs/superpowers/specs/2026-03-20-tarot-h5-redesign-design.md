# 2026-03-20 Tarot H5 Redesign Design

## Status

Approved in chat. Ready for implementation planning after written spec review.

## Scope

This redesign covers the user-facing H5 flow under `apps/web/src/app`:

- `/`
- `/consent`
- `/question`
- `/products`
- `/checkout`
- `/draw`
- `/reading/[id]`
- `/reading/[id]/followup`
- `/history`

Admin pages stay visually unchanged in this phase.

## Problem Statement

The current H5 flow is functionally complete, but the presentation still reads like a product demo:

- most user pages share the same generic two-column shell
- the homepage pushes a direct start action instead of guiding topic selection
- product, checkout, draw, and result pages feel operational rather than sacred or comforting
- current root fonts (`Cormorant Garamond` + `Manrope`) are Latin-oriented and do not provide a coherent Chinese typographic voice
- the frontend only exposes three backend `topic_type` values (`career`, `emotion`, `growth`), while the desired experience needs six user-facing ritual themes

The redesign should preserve the backend flow and route contract while changing the emotional tone, information hierarchy, and visual system.

## Goals

1. Make the H5 feel like a gentle spiritual ritual rather than a SaaS funnel.
2. Rebuild the homepage around six theme entrances instead of a direct draw CTA.
3. Create a coherent visual language that feels sacred, calm, and premium without becoming dark, oppressive, or theatrical.
4. Improve the readability and pacing of every step in the ritual flow on mobile first layouts.
5. Preserve the current API contract and backend orchestration.

## Non-Goals

- no backend API changes in this phase
- no admin redesign
- no new payment capability beyond the existing mock checkout
- no new route structure unless required by current pages
- no heavy decorative animation loops

## Experience Direction

### Core Mood

`Temple Classic` structure with a `Gentle Healing` emotional tone.

The site should feel like entering a quiet reading sanctuary:

- ivory paper instead of bright white
- old gold and sage instead of sharp neon or pure black-gold contrast
- fine borders, symbolic geometry, and arch framing instead of glass-heavy UI
- supportive microcopy instead of sales-forward CTA language

### Visual Language

- Backgrounds: layered parchment gradients, soft radial glow, subtle celestial linework
- Surfaces: paper cards with embossed-border feeling, soft shadows, translucent wash only when useful
- Shape language: arches, circular seals, thin constellation lines, framed card edges
- Motion: fade, reveal, shimmer band, gentle lift; avoid infinite decorative motion
- Density: generous whitespace, slower section rhythm, clear vertical breathing room

### Typography

The redesign should replace the current Latin-first pairing with a Chinese-readable pairing applied in root layout:

- Display: `Noto Serif SC` or equivalent high-contrast serif with good Simplified Chinese coverage
- Body: `Noto Sans SC` or equivalent neutral sans with strong mobile readability
- Optional accent: a restrained decorative serif for English marks, numbers, or ritual labels only

Typography should support:

- ceremonial headlines
- clean Chinese paragraph reading
- compact mobile labels without visual noise

## User-Facing Theme Model

The homepage and question flow expose six themes:

- 情绪疗愈
- 自我成长
- 关系修复
- 未来方向
- 能量净化
- 今日指引

To preserve the existing backend contract, the frontend maps them into the current `topic_type` values:

| Frontend theme | Backend `topic_type` |
| --- | --- |
| 情绪疗愈 | `emotion` |
| 自我成长 | `growth` |
| 关系修复 | `emotion` |
| 未来方向 | `career` |
| 能量净化 | `growth` |
| 今日指引 | `growth` |

Implementation should keep both values in client state:

- `entry_theme`: selected user-facing ritual theme
- `topic_type`: backend-facing normalized category

This preserves the richer ritual framing without forcing immediate backend expansion.

## Information Architecture

### Homepage

The homepage becomes a ritual foyer instead of a start screen.

Section order:

1. Hero with calm statement, supportive subcopy, and one primary prompt:
   `你此刻想被照见哪一面？`
2. Six ritual theme cards as the primary decision point
3. Three-step explanation of how the reading journey supports the user
4. Boundary and reassurance section covering consent, privacy, and non-crisis positioning
5. “What you will receive” section previewing reading outputs
6. Closing CTA returning the user to theme selection

The primary homepage CTA is theme selection, not immediate card draw.

### Flow Pages

The ritual flow remains:

`theme selection -> consent -> question -> products -> checkout -> draw -> reading -> followup/history`

However, each page should clearly acknowledge the chosen theme and current ritual stage.

## Page-by-Page Design

### Consent

Reframe consent as a calm threshold page:

- softer title and copy
- clear statement of emotional and safety boundaries
- visual emphasis on trust, privacy, and readiness
- one focused next action

### Question

Reframe as guided self-clarification:

- show current theme context at the top
- replace generic segment control wording with theme-aware framing
- add example prompts and input guidance
- treat risk-blocked state as a support panel, not a plain error card

### Products

Reframe products as “depth of companionship” choices:

- recommended option explained as a better fit for the current question
- card language focuses on reading depth, reflection scope, and follow-up richness
- prices remain visible but not dominant

### Checkout

Reframe checkout as ritual confirmation:

- selected reading summary
- order and value summary
- soft reassurance before commitment
- visual treatment similar to a reservation or ceremonial confirmation sheet

### Draw

Reframe draw as unfolding ceremony:

- progress rail with ritual language
- card-back placeholders or symbolic stage markers
- quiet anticipation rather than loading-page emptiness
- retry state remains explicit and actionable

### Reading Result

Make this the richest page in the experience:

- immediate top summary with the central message
- structured sections for theme, summary, cards, guidance, and next steps
- clear separation between the short takeaway and the longer interpretation
- strong follow-up entry point

### Follow-up and History

- Follow-up should feel like continuing a conversation, not appending a ticket comment.
- History should feel like a personal archive of readings, with softer list presentation and clearer revisit actions.

## Component and File Strategy

### Rework

Primary files expected to change:

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/page.tsx`
- `apps/web/src/components/common/app-shell.tsx`
- `apps/web/src/components/consent/consent-form.tsx`
- `apps/web/src/components/question/question-form.tsx`
- `apps/web/src/components/products/product-list.tsx`
- `apps/web/src/components/checkout/mock-checkout.tsx`
- `apps/web/src/components/draw/draw-stage.tsx`
- `apps/web/src/components/reading/reading-result.tsx`
- `apps/web/src/components/followup/followup-form.tsx`
- `apps/web/src/components/history/history-list.tsx`

### Likely New UI Primitives

- ritual theme card
- stage indicator / ritual progress rail
- trust note / sanctuary notice block
- reading section frame
- archive card

The redesign should avoid creating many shallow abstractions. New components should only be extracted when they clearly support reuse across the ritual flow.

## Shell Architecture

`AppShell` should no longer force one static layout for every page. It should support at least two variants:

- `home`: expressive foyer layout with richer composition
- `flow`: focused ritual layout for consent, question, products, checkout, draw, reading, followup, and history

Variant support can be done either by a `variant` prop or by splitting shell responsibilities into a shared wrapper plus page-specific composition blocks.

## Content and Tone Rules

- supportive, calm, and specific
- no exaggerated mysticism
- no loud sales phrasing
- no empty “AI spiritual” copy
- no emoji-based symbolism
- use concise ritual language only where it strengthens clarity

## Accessibility and Responsive Rules

- mobile first at minimum widths around 320px
- strong text contrast on warm surfaces
- visible focus styles
- reduced-motion support for all non-essential animation
- no horizontal scroll
- buttons and cards remain clearly tappable on touch devices

## Error Handling

The redesign must preserve and clarify existing operational states:

- missing guest token
- missing session or order context
- blocked risk checks
- API fetch failures
- pending states during checkout and reading generation

Operational errors should appear inside the ritual UI language, but they must remain explicit and actionable.

## Verification Plan

Before implementation is considered complete:

1. Walk the full H5 path manually in the browser.
2. Verify homepage theme selection persists into the flow.
3. Verify normalized `topic_type` requests still hit the existing backend API successfully.
4. Check responsive layouts at approximately `320`, `390`, `768`, and desktop widths.
5. Check loading, disabled, error, and retry states.
6. Confirm risk-block flow remains clear and supportive.
7. Confirm history and follow-up remain reachable after the redesign.

## Implementation Notes for Planning

- Preserve route structure and fetch calls.
- Introduce client-side theme mapping close to `reading-flow` state management.
- Keep the admin shell visually untouched.
- Treat this as a front-end experience rewrite, not a business-flow rewrite.

## Approval Record

The approved direction from chat is:

- user-facing H5 only
- full rewrite of the user experience, not just visual polish
- `Temple Classic` base mood
- `Gentle Healing` positioning
- homepage first action is theme selection
- user-facing themes use the healing-oriented set
- recommended design approach: `Sanctuary Editorial`
