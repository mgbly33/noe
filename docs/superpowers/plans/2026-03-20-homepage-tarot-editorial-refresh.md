# Homepage Tarot Editorial Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the public homepage so it teaches and visually embodies tarot, adds real tarot imagery, and fixes the oversized hero layout without changing the reading entry flow.

**Architecture:** Keep the current homepage route and theme-entry behavior intact, but rewrite the homepage content model, add local tarot card assets, and rebuild the hero into a mixed editorial collage. Verification will lock the public homepage contract with focused Playwright checks before and after implementation.

**Tech Stack:** Next.js App Router, React 19, TypeScript, global CSS, Next Image, Playwright

---

## File Map

- Create: `apps/web/public/images/tarot/high-priestess.jpg`
- Create: `apps/web/public/images/tarot/star.jpg`
- Create: `apps/web/public/images/tarot/moon.jpg`
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/globals.css`
- Modify: `tests/e2e/auth-guard.spec.ts`

## Task 1: Lock the homepage contract with a failing test

**Files:**
- Modify: `tests/e2e/auth-guard.spec.ts`

- [ ] **Step 1: Add a failing homepage expectation**

Add a test that verifies:

- the homepage exposes a tarot-focused educational heading
- the homepage renders the hero collage
- public navigation still hides admin

```ts
test("homepage foregrounds tarot guidance and hero imagery", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "塔罗不会替你决定人生，但会帮你看清此刻" })).toBeVisible();
  await expect(page.getByTestId("hero-tarot-collage")).toBeVisible();
});
```

- [ ] **Step 2: Run the focused Playwright file**

Run: `corepack pnpm playwright test tests/e2e/auth-guard.spec.ts`
Expected: FAIL because the current homepage copy and hero collage do not exist yet.

## Task 2: Add local tarot assets

**Files:**
- Create: `apps/web/public/images/tarot/high-priestess.jpg`
- Create: `apps/web/public/images/tarot/star.jpg`
- Create: `apps/web/public/images/tarot/moon.jpg`

- [ ] **Step 1: Download public-domain card art**

Use local copies of public-domain Rider-Waite-Smith cards from Wikimedia Commons.

- [ ] **Step 2: Keep filenames stable and descriptive**

Store them as:

- `high-priestess.jpg`
- `star.jpg`
- `moon.jpg`

## Task 3: Rebuild homepage content and hero composition

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/globals.css`

- [ ] **Step 1: Replace project-intro hero copy with tarot-first copy**

The hero should explain tarot as reflective guidance, not describe the site as a project or tool.

- [ ] **Step 2: Add a mixed hero collage**

Use 2-3 tarot cards plus decorative celestial layers.

Implementation notes:

- use `next/image`
- give the collage `data-testid="hero-tarot-collage"`
- keep the theme entrance below the hero

- [ ] **Step 3: Reduce headline size and widen text rhythm**

Adjust:

- headline `font-size`
- hero column ratio
- headline `max-width`
- hero panel spacing

- [ ] **Step 4: Rewrite supporting sections around tarot education**

Keep the existing section count compact, but make them about:

- tarot适合照见什么
- 什么问题适合交给塔罗
- 一次解读通常会展开哪些层次

- [ ] **Step 5: Preserve theme-card click behavior**

Do not change:

- `data-testid="theme-card-*"`
- theme mapping
- route push to `/consent`

## Task 4: Verify the refreshed homepage

**Files:**
- Modify as needed: `apps/web/src/app/page.tsx`
- Modify as needed: `apps/web/src/app/globals.css`
- Modify as needed: `tests/e2e/auth-guard.spec.ts`

- [ ] **Step 1: Run web lint**

Run: `corepack pnpm --dir apps/web lint`
Expected: PASS

- [ ] **Step 2: Run web typecheck**

Run: `corepack pnpm --dir apps/web typecheck`
Expected: PASS

- [ ] **Step 3: Run the focused homepage Playwright file**

Run: `corepack pnpm playwright test tests/e2e/auth-guard.spec.ts`
Expected: PASS

- [ ] **Step 4: Review the homepage in browser**

Check:

- desktop hero balance
- mobile hero stacking
- tarot collage visibility
- absence of project-intro language
