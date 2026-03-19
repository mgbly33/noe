import { expect, test } from "@playwright/test";

test("unauthenticated user is redirected to login from a protected page", async ({
  page,
}) => {
  await page.goto("/history");

  await expect(page).toHaveURL(/\/auth\/login\?redirect=%2Fhistory/);
});

test("public navigation exposes auth entry points but not admin", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0);
  await expect(page.getByTestId("nav-login")).toBeVisible();
  await expect(page.getByTestId("nav-register")).toBeVisible();
});

test("registration succeeds and lands on consent", async ({ page }) => {
  await page.goto("/auth/register");
  await page
    .getByTestId("register-username")
    .fill(`user_${Date.now().toString(36)}`);
  await page.getByTestId("register-password").fill("secret123");
  await page.getByTestId("register-confirm-password").fill("secret123");
  await page.getByTestId("register-submit").click();

  await expect(page).toHaveURL(/\/consent$/);
  await expect(page.getByTestId("consent-checkbox")).toBeVisible();
});

test("authenticated normal user cannot stay on admin routes", async ({
  page,
}) => {
  await page.goto("/auth/register");
  await page
    .getByTestId("register-username")
    .fill(`member_${Date.now().toString(36)}`);
  await page.getByTestId("register-password").fill("secret123");
  await page.getByTestId("register-confirm-password").fill("secret123");
  await page.getByTestId("register-submit").click();
  await expect(page).toHaveURL(/\/consent$/);

  await page.goto("/admin/products");

  await expect(page).toHaveURL(/\/account$/);
});
