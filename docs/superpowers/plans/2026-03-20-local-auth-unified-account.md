# Local Auth Unified Account Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the public guest flow with real username/password accounts, unify user and admin sessions, require login before any business action, and hide admin access behind authenticated role checks.

**Architecture:** Keep the existing single `t_user` table and business `user_id` ownership model, add `local` registration/login on the API, reuse the current admin role checks, and switch the web app from split guest/admin localStorage state to one unified session plus reusable client-side route guards. Password storage moves from plain text to a salted hash using Node crypto so the change stays self-contained in the current stack.

**Tech Stack:** NestJS, Prisma, Next.js App Router, React 19, Playwright, Jest e2e, Node `crypto.scrypt`

---

## File Map

### API auth and seed

- Create: `apps/api/src/modules/auth/password.ts`
- Create: `apps/api/src/modules/auth/password.spec.ts`
- Modify: `apps/api/src/modules/auth/auth.controller.ts`
- Modify: `apps/api/src/modules/auth/auth.service.ts`
- Modify: `database/prisma/seed.ts`
- Modify: `apps/api/src/modules/auth/auth.module.ts` only if a provider or export is needed for password helpers

### API tests

- Create: `apps/api/test/auth-local-account.e2e-spec.ts`
- Modify: `apps/api/test/followup-history-admin.e2e-spec.ts`
- Modify: `apps/api/test/auth-consent.e2e-spec.ts`

### Web auth/session

- Modify: `apps/web/src/lib/api/client.ts`
- Modify: `apps/web/src/lib/auth/session.ts`
- Create: `apps/web/src/lib/auth/route-guards.ts`
- Modify: `apps/web/src/lib/state/reading-flow.ts`

### Web routes and shells

- Create: `apps/web/src/app/auth/login/page.tsx`
- Create: `apps/web/src/app/auth/register/page.tsx`
- Create: `apps/web/src/app/account/page.tsx`
- Modify: `apps/web/src/components/common/app-shell.tsx`
- Modify: `apps/web/src/app/admin/layout.tsx`
- Modify: `apps/web/src/app/admin/login/page.tsx`
- Modify: `apps/web/src/app/consent/page.tsx`
- Modify: `apps/web/src/app/question/page.tsx`
- Modify: `apps/web/src/app/products/page.tsx`
- Modify: `apps/web/src/app/checkout/page.tsx`
- Modify: `apps/web/src/app/draw/page.tsx`
- Modify: `apps/web/src/app/reading/[id]/page.tsx`
- Modify: `apps/web/src/app/reading/[id]/followup/page.tsx`
- Modify: `apps/web/src/app/history/page.tsx`

### Web e2e

- Create: `tests/e2e/auth-guard.spec.ts`
- Modify: `tests/e2e/user-happy-path.spec.ts`
- Modify: `tests/e2e/admin-flow.spec.ts`

### Optional follow-up docs

- Modify: `README.md` if local login instructions or admin credential wording become inaccurate after implementation

## Task 1: Password Hashing Groundwork

**Files:**
- Create: `apps/api/src/modules/auth/password.ts`
- Create: `apps/api/src/modules/auth/password.spec.ts`
- Modify: `database/prisma/seed.ts`
- Test: `apps/api/src/modules/auth/password.spec.ts`

- [ ] **Step 1: Write the failing password helper test**

```ts
import { hashPassword, verifyPassword } from './password';

describe('password helpers', () => {
  it('hashes and verifies a password', () => {
    const hash = hashPassword('admin123456');

    expect(hash).not.toBe('admin123456');
    expect(verifyPassword('admin123456', hash)).toBe(true);
    expect(verifyPassword('wrong-password', hash)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `corepack pnpm --filter @ai-tarot/api test -- --runInBand src/modules/auth/password.spec.ts`
Expected: FAIL because `password.ts` helpers do not exist yet.

- [ ] **Step 3: Implement minimal password hashing**

```ts
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const digest = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${digest}`;
};

export const verifyPassword = (password: string, storedHash: string) => {
  const [salt, expected] = storedHash.split(':');
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
};
```

- [ ] **Step 4: Re-run the password helper test**

Run: `corepack pnpm --filter @ai-tarot/api test -- --runInBand src/modules/auth/password.spec.ts`
Expected: PASS

- [ ] **Step 5: Update seed data to hash the admin password**

```ts
password_hash: hashPassword('admin123456')
```

- [ ] **Step 6: Re-seed the database**

Run: `corepack pnpm db:seed`
Expected: PASS and seed output still mentions the admin account.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/modules/auth/password.ts apps/api/src/modules/auth/password.spec.ts database/prisma/seed.ts
git commit -m "feat: hash stored auth passwords"
```

## Task 2: Local Register/Login/Me API Contract

**Files:**
- Create: `apps/api/test/auth-local-account.e2e-spec.ts`
- Modify: `apps/api/src/modules/auth/auth.controller.ts`
- Modify: `apps/api/src/modules/auth/auth.service.ts`
- Test: `apps/api/test/auth-local-account.e2e-spec.ts`

- [ ] **Step 1: Write the failing e2e tests for register, login, duplicate usernames, and me**

```ts
it('registers a local user and returns a login session', async () => {
  const response = await request(app.getHttpServer()).post('/auth/register').send({
    login_type: 'local',
    login_name: `user_${Date.now()}`,
    password: 'secret123',
    channel: 'h5',
  });

  expect(response.status).toBe(201);
  expect(unwrapData<{ role: string; login_name: string }>(response.body)).toMatchObject({
    role: 'user',
    login_name: expect.stringContaining('user_'),
  });
});
```

- [ ] **Step 2: Run the new auth e2e test file**

Run: `corepack pnpm --filter @ai-tarot/api test:e2e -- --runInBand test/auth-local-account.e2e-spec.ts`
Expected: FAIL because `/auth/register` and the expanded login payload do not exist yet.

- [ ] **Step 3: Add `POST /auth/register` and `GET /auth/me` to the controller**

```ts
@Post('register')
register(@Body() body: RegisterBody) {
  return { code: 0, data: await this.authService.register(body) };
}

@Get('me')
me(@Headers('authorization') authorization?: string) {
  return { code: 0, data: await this.authService.me(authorization) };
}
```

- [ ] **Step 4: Implement local registration in `AuthService`**

```ts
if (body.login_type !== 'local') {
  throw new BadRequestException('Unsupported login type.');
}

const existing = await this.prisma.user.findFirst({ where: { login_name: body.login_name } });
if (existing) {
  throw new BadRequestException('Login name already exists.');
}
```

- [ ] **Step 5: Replace plain-text admin/local login comparison with password verification**

```ts
const account = await this.prisma.user.findFirst({
  where: { login_name: body.login_name, status: 'active' },
});

if (!account?.password_hash || !verifyPassword(body.password, account.password_hash)) {
  throw new UnauthorizedException('Invalid credentials.');
}
```

- [ ] **Step 6: Return one unified session shape**

```ts
return {
  user_id: account.user_id,
  token: this.signAccessToken({ user_id: account.user_id, role: account.role, channel }),
  role: account.role,
  login_name: account.login_name,
  need_consent: await this.needsConsentByUserId(account.user_id),
};
```

- [ ] **Step 7: Re-run the auth e2e file**

Run: `corepack pnpm --filter @ai-tarot/api test:e2e -- --runInBand test/auth-local-account.e2e-spec.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/modules/auth/auth.controller.ts apps/api/src/modules/auth/auth.service.ts apps/api/test/auth-local-account.e2e-spec.ts
git commit -m "feat: add local register login and me endpoints"
```

## Task 3: API Authorization and Data Isolation Regression

**Files:**
- Modify: `apps/api/test/auth-consent.e2e-spec.ts`
- Modify: `apps/api/test/followup-history-admin.e2e-spec.ts`
- Test: `apps/api/test/auth-consent.e2e-spec.ts`
- Test: `apps/api/test/followup-history-admin.e2e-spec.ts`

- [ ] **Step 1: Add a failing consent-flow test for a newly registered local user**

```ts
it('creates a local session token and still requires consent', async () => {
  const response = await request(app.getHttpServer()).post('/auth/register').send({
    login_type: 'local',
    login_name: `consent_${Date.now()}`,
    password: 'secret123',
    channel: 'h5',
  });

  const data = unwrapData<{ need_consent: boolean }>(response.body);
  expect(data.need_consent).toBe(true);
});
```

- [ ] **Step 2: Add a failing history/admin regression for two local users**

```ts
expect(userAHistory.items.some((item) => item.reading_id === userBReadingId)).toBe(false);
expect(adminReadingsWithUserToken.status).toBe(403);
```

- [ ] **Step 3: Run the two API regression files**

Run: `corepack pnpm --filter @ai-tarot/api test:e2e -- --runInBand test/auth-consent.e2e-spec.ts test/followup-history-admin.e2e-spec.ts`
Expected: FAIL until test helpers stop creating guest tokens and use local users.

- [ ] **Step 4: Replace guest-token helpers in the test files with local-register helpers**

```ts
const registerLocalUser = async () => {
  const response = await request(app.getHttpServer()).post('/auth/register').send({
    login_type: 'local',
    login_name: `user_${Date.now()}_${Math.random()}`,
    password: 'secret123',
    channel: 'h5',
  });
  return unwrapData<{ token: string }>(response.body).token;
};
```

- [ ] **Step 5: Re-run the two API regression files**

Run: `corepack pnpm --filter @ai-tarot/api test:e2e -- --runInBand test/auth-consent.e2e-spec.ts test/followup-history-admin.e2e-spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/api/test/auth-consent.e2e-spec.ts apps/api/test/followup-history-admin.e2e-spec.ts
git commit -m "test: cover local auth consent and isolation flows"
```

## Task 4: Unified Web Session and Auth Client

**Files:**
- Modify: `apps/web/src/lib/api/client.ts`
- Modify: `apps/web/src/lib/auth/session.ts`
- Create: `apps/web/src/lib/auth/route-guards.ts`
- Modify: `apps/web/src/lib/state/reading-flow.ts`
- Test: `tests/e2e/auth-guard.spec.ts`

- [ ] **Step 1: Write a failing Playwright test for protected-route redirect**

```ts
test('unauthenticated user is redirected to login from a protected page', async ({ page }) => {
  await page.goto('/history');
  await expect(page).toHaveURL(/\/auth\/login\?redirect=%2Fhistory/);
});
```

- [ ] **Step 2: Run the new Playwright test**

Run: `corepack pnpm playwright test tests/e2e/auth-guard.spec.ts`
Expected: FAIL because protected pages still allow anonymous guest flow.

- [ ] **Step 3: Expand the web API client to support register, local login, and me**

```ts
registerLocal: (body: { login_type: 'local'; login_name: string; password: string; channel: 'h5' }) => ...
loginLocal: (body: { login_type: 'local'; login_name: string; password: string; channel: 'h5' }) => ...
getMe: (token: string) => apiRequest<SessionUser>('/auth/me', { token })
```

- [ ] **Step 4: Replace guest/admin storage with one session record**

```ts
const SESSION_KEY = 'ai-tarot-session';

export const saveSession = (session: AuthSession) => { ... };
export const getSession = () => { ... };
export const clearSession = () => { ... };
```

- [ ] **Step 5: Add reusable client-side route guards**

```ts
export const useRequireSession = (redirectTo: string) => { ... };
export const useRequireAdmin = () => { ... };
```

- [ ] **Step 6: Keep reading-flow identity-free**

```ts
type ReadingFlowState = {
  consent_versions?: ConsentVersions;
  consent_accepted?: boolean;
  entry_theme?: RitualThemeSlug;
  // token and user_id removed from this store
};
```

- [ ] **Step 7: Re-run the redirect test**

Run: `corepack pnpm playwright test tests/e2e/auth-guard.spec.ts`
Expected: still FAIL until pages use the new guards, but the client/session helpers compile cleanly.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/lib/api/client.ts apps/web/src/lib/auth/session.ts apps/web/src/lib/auth/route-guards.ts apps/web/src/lib/state/reading-flow.ts tests/e2e/auth-guard.spec.ts
git commit -m "refactor: unify web auth session handling"
```

## Task 5: Auth Pages, Account Center, and Navigation

**Files:**
- Create: `apps/web/src/app/auth/login/page.tsx`
- Create: `apps/web/src/app/auth/register/page.tsx`
- Create: `apps/web/src/app/account/page.tsx`
- Modify: `apps/web/src/components/common/app-shell.tsx`
- Modify: `apps/web/src/app/admin/login/page.tsx`
- Modify: `tests/e2e/auth-guard.spec.ts`
- Modify: `tests/e2e/admin-flow.spec.ts`

- [ ] **Step 1: Extend the failing Playwright tests to cover register, nav visibility, and admin discovery**

```ts
await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0);
await page.goto('/auth/register');
await page.getByTestId('register-username').fill(`user_${Date.now()}`);
```

- [ ] **Step 2: Run the auth and admin Playwright tests**

Run: `corepack pnpm playwright test tests/e2e/auth-guard.spec.ts tests/e2e/admin-flow.spec.ts`
Expected: FAIL because the auth pages and account page do not exist yet.

- [ ] **Step 3: Build `/auth/register` with inline validation and immediate session save**

```tsx
if (password !== confirmPassword) {
  setError('Passwords do not match.');
  return;
}

const session = await registerLocal(loginName, password);
saveSession(session);
router.push('/consent');
```

- [ ] **Step 4: Build `/auth/login` with redirect-aware success handling**

```tsx
const target = searchParams.get('redirect');
router.push(session.need_consent ? '/consent' : target ?? '/account');
```

- [ ] **Step 5: Build `/account` and conditionally show the admin entrance**

```tsx
{session.role === 'admin' || session.role === 'super_admin' ? (
  <Link href="/admin/products" data-testid="account-admin-entry">Open Admin</Link>
) : null}
```

- [ ] **Step 6: Remove the public admin link from `AppShell` and swap in auth/account links**

```tsx
const session = getSession();
```

- [ ] **Step 7: Turn `/admin/login` into a compatibility redirect**

```tsx
redirect('/auth/login?redirect=%2Fadmin%2Fproducts');
```

- [ ] **Step 8: Re-run the auth and admin Playwright tests**

Run: `corepack pnpm playwright test tests/e2e/auth-guard.spec.ts tests/e2e/admin-flow.spec.ts`
Expected: PASS for navigation and auth-page coverage.

- [ ] **Step 9: Commit**

```bash
git add apps/web/src/app/auth/login/page.tsx apps/web/src/app/auth/register/page.tsx apps/web/src/app/account/page.tsx apps/web/src/components/common/app-shell.tsx apps/web/src/app/admin/login/page.tsx tests/e2e/auth-guard.spec.ts tests/e2e/admin-flow.spec.ts
git commit -m "feat: add auth pages and account center"
```

## Task 6: Protect All Business Pages and Restore the User Flow

**Files:**
- Modify: `apps/web/src/app/consent/page.tsx`
- Modify: `apps/web/src/app/question/page.tsx`
- Modify: `apps/web/src/app/products/page.tsx`
- Modify: `apps/web/src/app/checkout/page.tsx`
- Modify: `apps/web/src/app/draw/page.tsx`
- Modify: `apps/web/src/app/reading/[id]/page.tsx`
- Modify: `apps/web/src/app/reading/[id]/followup/page.tsx`
- Modify: `apps/web/src/app/history/page.tsx`
- Modify: `apps/web/src/app/admin/layout.tsx`
- Modify: `tests/e2e/user-happy-path.spec.ts`

- [ ] **Step 1: Rewrite the happy-path test so it starts with registration**

```ts
await page.goto('/');
await page.goto('/auth/register');
await page.getByTestId('register-username').fill(`user_${Date.now()}`);
await page.getByTestId('register-password').fill('secret123');
await page.getByTestId('register-confirm-password').fill('secret123');
await page.getByTestId('register-submit').click();
```

- [ ] **Step 2: Run the happy-path and auth-guard Playwright files**

Run: `corepack pnpm playwright test tests/e2e/user-happy-path.spec.ts tests/e2e/auth-guard.spec.ts`
Expected: FAIL because flow pages still call `ensureGuestSession()` and `getGuestToken()`.

- [ ] **Step 3: Replace guest-session access in all user-flow pages**

```ts
const session = useRequireSession('/auth/login');
const token = session?.token;
```

- [ ] **Step 4: Preserve consent and business flow on top of the unified session**

```ts
if (!token) {
  return;
}

await apiClient.acceptConsent(token, { ...versions, accepted: true });
```

- [ ] **Step 5: Enforce role checks in admin layout with the shared guard**

```ts
const session = useRequireAdmin();
if (!session) return null;
```

- [ ] **Step 6: Re-run the happy-path and auth-guard Playwright files**

Run: `corepack pnpm playwright test tests/e2e/user-happy-path.spec.ts tests/e2e/auth-guard.spec.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/consent/page.tsx apps/web/src/app/question/page.tsx apps/web/src/app/products/page.tsx apps/web/src/app/checkout/page.tsx apps/web/src/app/draw/page.tsx apps/web/src/app/reading/[id]/page.tsx apps/web/src/app/reading/[id]/followup/page.tsx apps/web/src/app/history/page.tsx apps/web/src/app/admin/layout.tsx tests/e2e/user-happy-path.spec.ts
git commit -m "feat: require login across the reading flow"
```

## Task 7: Full Verification and Final Cleanup

**Files:**
- Modify: `README.md` only if login instructions are now stale
- Test: `apps/api/src/modules/auth/password.spec.ts`
- Test: `apps/api/test/auth-local-account.e2e-spec.ts`
- Test: `apps/api/test/auth-consent.e2e-spec.ts`
- Test: `apps/api/test/followup-history-admin.e2e-spec.ts`
- Test: `tests/e2e/auth-guard.spec.ts`
- Test: `tests/e2e/user-happy-path.spec.ts`
- Test: `tests/e2e/admin-flow.spec.ts`

- [ ] **Step 1: Run API lint**

Run: `corepack pnpm --filter @ai-tarot/api lint`
Expected: PASS

- [ ] **Step 2: Run API typecheck**

Run: `corepack pnpm --filter @ai-tarot/api typecheck`
Expected: PASS

- [ ] **Step 3: Run focused API tests**

Run: `corepack pnpm --filter @ai-tarot/api test -- --runInBand src/modules/auth/password.spec.ts`
Expected: PASS

Run: `corepack pnpm --filter @ai-tarot/api test:e2e -- --runInBand test/auth-local-account.e2e-spec.ts test/auth-consent.e2e-spec.ts test/followup-history-admin.e2e-spec.ts`
Expected: PASS

- [ ] **Step 4: Run web lint and typecheck**

Run: `corepack pnpm --dir apps/web lint`
Expected: PASS

Run: `corepack pnpm --dir apps/web typecheck`
Expected: PASS

- [ ] **Step 5: Run Playwright auth coverage**

Run: `corepack pnpm playwright test tests/e2e/auth-guard.spec.ts tests/e2e/user-happy-path.spec.ts tests/e2e/admin-flow.spec.ts`
Expected: PASS

- [ ] **Step 6: Update README if needed**

```md
- User flow now requires registration/login before consent and readings.
- Admin access is role-gated and no longer exposed in the public nav.
```

- [ ] **Step 7: Review git diff for unrelated churn**

Run: `git status --short`
Expected: only intended auth-related changes plus the already-existing UI redesign worktree changes.

- [ ] **Step 8: Final commit**

```bash
git add apps/api apps/web tests/e2e README.md
git commit -m "feat: add unified local auth and protected routes"
```
