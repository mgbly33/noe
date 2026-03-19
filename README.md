# AI Tarot MVP

Monorepo for the first production-oriented AI Tarot MVP slice:

- `apps/web`: Next.js H5 frontend and minimal admin console
- `apps/api`: NestJS backend with auth, consent, catalog, payments, readings, follow-up, history, and admin APIs
- `packages/shared`: shared contracts and domain constants
- `database`: Prisma schema, migrations, and seed data

## Prerequisites

- Node.js 20+
- Corepack
- MySQL 8.0+ running locally
- Playwright Chromium browser

## Local Environment

1. Copy `.env.example` to `.env`.
2. Fill `DATABASE_URL`, `DATABASE_SHADOW_URL`, `JWT_SECRET`, `API_PORT`, and `NEXT_PUBLIC_API_BASE_URL`.
3. Start MySQL locally or with Docker.

## Setup

```bash
corepack pnpm install
corepack pnpm db:generate
corepack pnpm db:migrate -- --name init
corepack pnpm db:seed
corepack pnpm db:check-seed
corepack pnpm playwright:install
```

## Run Locally

Start the backend:

```bash
corepack pnpm dev:api
```

Start the web app in another terminal:

```bash
corepack pnpm dev:web
```

Default ports:

- Web: `http://127.0.0.1:3000`
- API: `http://127.0.0.1:3001`

## Demo Credentials

- Admin login: `admin` / `admin123456`

## Verification

API-focused checks:

```bash
corepack pnpm --filter @ai-tarot/api lint
corepack pnpm --filter @ai-tarot/api typecheck
corepack pnpm test:api:e2e -- auth-consent.e2e-spec.ts
corepack pnpm test:api:e2e -- risk-session-catalog.e2e-spec.ts
corepack pnpm test:api:e2e -- orders-payments-assets.e2e-spec.ts
corepack pnpm test:api:e2e -- readings-generate.e2e-spec.ts
corepack pnpm test:api:e2e -- followup-history-admin.e2e-spec.ts
corepack pnpm test:api:e2e -- app-smoke.e2e-spec.ts
```

Workspace checks:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
```

Browser flows:

```bash
corepack pnpm test:e2e
```

Playwright stores run artifacts under `output/playwright/`.
