# AI Tarot MVP

Monorepo for the first production-oriented AI Tarot MVP slice:

- `apps/web`: Next.js H5 frontend and minimal admin
- `apps/api`: NestJS backend
- `packages/shared`: shared contracts and domain constants
- `database`: Prisma schema, migrations, and seed data

## Prerequisites

- Node.js 20+
- `corepack`
- MySQL 8.0+ or Docker Desktop

## Getting Started

1. Copy `.env.example` to `.env`.
2. Start MySQL with Docker or use a local MySQL instance.
3. Use `corepack pnpm install`.
4. Run database migration and seed scripts.
5. Start web and api apps with the monorepo scripts.

The rest of the implementation will add exact project commands as the apps are scaffolded.
