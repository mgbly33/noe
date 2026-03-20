# 2026-03-20 OpenAI Reading Provider Design

## Status

Approved in chat for implementation.

## Scope

This pass replaces the API's tarot text generation layer with OpenAI while keeping the current business flow, database schema, and frontend contract unchanged.

In scope:

- root `.env` OpenAI configuration
- a shared OpenAI provider for tarot text generation
- reading generation using OpenAI
- follow-up reply generation using OpenAI
- deterministic fallback behavior for local tests
- focused API verification

Out of scope:

- frontend flow changes
- schema changes
- admin UI redesign
- payment changes

## Problem Statement

The current project stores and exposes a full tarot reading flow, but the actual text generation is still mock-based:

- `GenerationService` uses `MockAiProvider`
- follow-up replies are hard-coded strings
- `.env` has no model vendor configuration
- prompt policy publishing only changes metadata, not a real model integration

This prevents the project from producing real model-backed readings even though the rest of the flow is already in place.

## Goals

1. Replace mock reading generation with OpenAI-backed generation.
2. Replace normal follow-up replies with OpenAI-backed replies.
3. Keep the existing API response shape and persistence model.
4. Use the user-provided local OpenAI-compatible gateway and model:
   - base URL: `http://localhost:8317`
   - model: `gpt-5.4`
5. Keep automated tests deterministic and independent from live model calls.

## Configuration Model

The integration uses root-level environment variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_BASE_URL`
- `OPENAI_REASONING_EFFORT`

Normalization rule:

- if the configured base URL does not include a path, treat it as an OpenAI-compatible root and append `/v1`

For the user-provided local gateway, runtime should resolve:

- `http://localhost:8317` -> `http://localhost:8317/v1`

## Runtime Strategy

### Shared provider

Create one shared OpenAI tarot provider and inject it into both:

- reading generation
- follow-up reply generation

This avoids duplicated SDK setup and keeps model, key, and error handling in one place.

### Prompt strategy

For reading generation:

- reuse the active prompt policy from the database
- use its `prompt_template.system` as the base system instruction when available
- preserve `policy_version` persistence

For follow-up replies:

- use a fixed follow-up instruction with the current reading context
- blocked-risk follow-ups still return the existing safety text immediately

### Output shape

The OpenAI provider must still return the same logical data the API currently persists:

- `structuredResult`
- `finalText`
- `modelVendor`
- `modelVersion`
- `promptVersion`
- `policyVersion`
- `safetyResult`
- `latencyMs`
- `tokenInput`
- `tokenOutput`

The existing frontend and database should not need to change.

## Test Strategy

Live OpenAI calls should not run inside Jest.

Test approach:

- unit-test the new provider with mocked OpenAI SDK responses
- keep e2e tests deterministic by falling back to the existing mock behavior when `NODE_ENV=test`

This preserves reliable CI and local test runs while allowing real model calls in development runtime.

## Secret Handling

The user-provided API key should be written to local `.env` for runtime use, but it must not be committed to git.

Committed documentation should update `.env.example` only with placeholders.

## Verification Plan

Before this pass is complete:

1. Provider unit tests prove request mapping and response parsing.
2. API lint passes.
3. API typecheck passes.
4. Focused API tests pass without live OpenAI dependency.
5. Local runtime reads the configured OpenAI endpoint and model from `.env`.

## Approval Record

Approved in chat:

- use OpenAI
- use local gateway base `http://localhost:8317`
- use the provided API key locally
- use model `gpt-5.4`
