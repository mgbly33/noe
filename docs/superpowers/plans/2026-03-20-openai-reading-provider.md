# OpenAI Reading Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the API's mock tarot generation with a real OpenAI-backed provider while keeping the existing business flow and test determinism.

**Architecture:** Add a shared OpenAI provider module, wire it into reading generation and follow-up replies, and preserve mock fallback in `test` mode so API tests stay deterministic. Runtime configuration lives in root `.env`, while `.env.example` only documents placeholders.

**Tech Stack:** NestJS, Prisma, OpenAI Node SDK, Jest, Supertest

---

## File Map

- Create: `apps/api/src/modules/ai/ai.module.ts`
- Create: `apps/api/src/modules/ai/openai-tarot.provider.ts`
- Create: `apps/api/src/modules/ai/openai-tarot.provider.spec.ts`
- Modify: `apps/api/src/modules/readings/generation.service.ts`
- Modify: `apps/api/src/modules/readings/readings.module.ts`
- Modify: `apps/api/src/modules/followups/followups.module.ts`
- Modify: `apps/api/src/modules/followups/followups.service.ts`
- Modify: `apps/api/package.json`
- Modify: `.env.example`
- Modify locally only: `.env`

## Task 1: Lock provider behavior with failing unit tests

**Files:**
- Create: `apps/api/src/modules/ai/openai-tarot.provider.spec.ts`

- [ ] **Step 1: Write the failing provider tests**

Cover:

- base URL normalization from `http://localhost:8317` to `http://localhost:8317/v1`
- reading JSON parsing from `response.output_text`
- follow-up JSON parsing from fenced or plain JSON

- [ ] **Step 2: Run the provider test file**

Run: `corepack pnpm --filter @ai-tarot/api test -- src/modules/ai/openai-tarot.provider.spec.ts`
Expected: FAIL because the provider does not exist yet.

## Task 2: Implement the shared OpenAI provider

**Files:**
- Create: `apps/api/src/modules/ai/openai-tarot.provider.ts`
- Create: `apps/api/src/modules/ai/ai.module.ts`
- Modify: `apps/api/package.json`

- [ ] **Step 1: Add the OpenAI SDK dependency**

Install `openai` in `@ai-tarot/api`.

- [ ] **Step 2: Implement provider config helpers**

Include:

- `isConfigured()`
- base URL normalization
- model selection
- reasoning effort selection

- [ ] **Step 3: Implement reading generation**

Return mapped fields compatible with the current interpretation persistence contract.

- [ ] **Step 4: Implement follow-up generation**

Return a reply string plus vendor/version metadata.

- [ ] **Step 5: Re-run the provider unit tests**

Run: `corepack pnpm --filter @ai-tarot/api test -- src/modules/ai/openai-tarot.provider.spec.ts`
Expected: PASS

## Task 3: Wire the provider into readings and follow-ups

**Files:**
- Modify: `apps/api/src/modules/readings/generation.service.ts`
- Modify: `apps/api/src/modules/readings/readings.module.ts`
- Modify: `apps/api/src/modules/followups/followups.module.ts`
- Modify: `apps/api/src/modules/followups/followups.service.ts`

- [ ] **Step 1: Import the shared AI module where needed**

- [ ] **Step 2: Update `GenerationService`**

Behavior:

- use OpenAI provider in non-test runtime when configured
- fall back to existing mock provider in test mode or missing config

- [ ] **Step 3: Update `FollowupsService`**

Behavior:

- blocked risk keeps the current safety reply
- normal follow-up replies use OpenAI in non-test runtime when configured
- test mode or missing config falls back to current deterministic reply

- [ ] **Step 4: Preserve persistence metadata**

Store real `model_vendor` / `model_version` when OpenAI is used.

## Task 4: Configure environment files safely

**Files:**
- Modify: `.env.example`
- Modify locally only: `.env`

- [ ] **Step 1: Add placeholder OpenAI variables to `.env.example`**

- [ ] **Step 2: Write the user-provided runtime values to local `.env`**

Do not commit the real secret.

## Task 5: Verify API behavior

**Files:**
- Modify as needed: files from Tasks 1-4

- [ ] **Step 1: Run API lint**

Run: `corepack pnpm --filter @ai-tarot/api lint`
Expected: PASS

- [ ] **Step 2: Run API typecheck**

Run: `corepack pnpm --filter @ai-tarot/api typecheck`
Expected: PASS

- [ ] **Step 3: Run focused provider unit tests**

Run: `corepack pnpm --filter @ai-tarot/api test -- src/modules/ai/openai-tarot.provider.spec.ts`
Expected: PASS

- [ ] **Step 4: Run focused auth and reading e2e tests**

Run: `corepack pnpm --filter @ai-tarot/api test:e2e -- test/auth-local-account.e2e-spec.ts test/followup-history-admin.e2e-spec.ts`
Expected: PASS
