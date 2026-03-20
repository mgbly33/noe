# 2026-03-20 Homepage Tarot Editorial Refresh Design

## Status

Approved in chat for implementation.

## Scope

This pass only updates the public homepage at `apps/web/src/app/page.tsx` and its supporting visual assets/styles.

In scope:

- homepage hero typography and layout balance
- homepage copy direction
- tarot-focused educational sections
- tarot imagery on the homepage
- supporting CSS and public assets
- focused homepage browser verification

Out of scope:

- auth flow logic
- consent, question, products, checkout, draw, reading, follow-up, or history page structure
- admin pages
- backend API changes

## Problem Statement

The current homepage still explains the product more than it explains tarot:

- the hero copy reads like project positioning instead of tarot guidance
- the headline is oversized and constrained into a narrow text column
- the right side of the hero leaves too much visual emptiness
- the page lacks tarot imagery, so the experience feels text-heavy
- the current information architecture says what the site does more than what tarot is for

This weakens the emotional entry. The homepage should first help the visitor understand tarot as a reflective practice, then invite them into the reading flow.

## Goals

1. Replace project-intro language with tarot-centered language.
2. Add tarot imagery without turning the page into a noisy mysticism poster.
3. Reduce hero headline size and make the first screen feel visually balanced.
4. Fill the current right-side emptiness with a composed visual collage instead of more copy.
5. Preserve the existing homepage theme-selection action and route flow.

## Experience Direction

### Content stance

The homepage should speak as a tarot guide, not as a product explainer.

The first screen should answer:

- what tarot helps you look at
- what kind of questions tarot is suited for
- what kind of response a reading can offer

It should not spend prime space explaining that this is a system, tool, or project.

### Visual stance

The homepage uses a mixed visual language with clear hierarchy:

- real Rider-Waite-Smith card imagery for credibility
- subtle celestial illustration layers for atmosphere
- editorial spacing and typography for restraint

Real card faces are the primary image layer. Decorative illustration supports them and must never overpower them.

## Hero Design

The homepage hero becomes a denser editorial composition:

- left: smaller, calmer headline with tarot-first copy
- right: layered collage with 2-3 real tarot cards, celestial ornaments, and framed sanctuary styling

Typography changes:

- hero headline is reduced from the current oversized display treatment
- line length becomes wider so Chinese text reads as 2-3 balanced lines instead of a compressed vertical stack
- the hero copy block should occupy more horizontal width

Layout changes:

- the left column becomes the primary reading column
- the right column becomes a composed visual altar, not a text-heavy secondary card
- desktop should avoid large dead space on the right

## Homepage Content Architecture

The homepage should read in this order:

1. Hero: tarot as a quiet mirror rather than a promise of answers
2. Theme entrance: keep the existing six theme cards
3. Tarot introduction: explain what tarot can help illuminate
4. Asking guidance: explain what kinds of questions are better suited to tarot
5. Reading structure: explain what the visitor will usually receive from a reading

The existing trust/boundary content may remain, but it should be framed as responsible reading guidance instead of product reassurance.

## Image Strategy

Use public-domain Rider-Waite-Smith card images from Wikimedia Commons and store local copies under the web public assets directory.

Recommended cards for the homepage collage:

- The High Priestess
- The Star
- The Moon

Why:

- they are visually recognizable
- they fit the sacred, reflective, and intuitive tone
- they give variation in silhouette and color without becoming aggressive

Decorative support may include:

- constellation linework
- moon halo gradients
- thin gold rings
- arch frames

Avoid:

- animated glitter overload
- fake neon occult aesthetics
- AI-looking fantasy art replacing actual tarot cards

## Implementation Notes

- Preserve the current `data-testid="theme-card-*"` theme buttons and click behavior.
- Add new stable selectors for homepage visual verification where useful, especially the hero collage.
- Keep the homepage public.
- Use local assets, not third-party hotlinks.

## Verification Plan

Before this pass is complete:

1. Homepage shows tarot imagery on desktop and mobile.
2. Hero no longer contains project-intro phrasing.
3. The hero headline is visibly smaller and more balanced than the current version.
4. Theme-card entry into `/consent` still works.
5. Desktop hero no longer leaves a large empty zone to the right.
6. The homepage still renders cleanly at mobile widths.

## Approval Record

Approved in chat:

- homepage copy should explain tarot, not the project
- homepage may include both real tarot cards and mystical illustration
- the mixed-image approach should keep real card faces as the primary visual layer
- the current oversized headline and empty right-side hero space should be corrected
