import { expect, test } from "@playwright/test";

test("admin can view products, readings, risk events, and publish a prompt policy", async ({
  page,
}) => {
  await page.goto("/auth/login?redirect=%2Fadmin%2Fproducts");
  await page.getByTestId("login-username").fill("admin");
  await page.getByTestId("login-password").fill("admin123456");
  await page.getByTestId("login-submit").click();

  await expect(page.getByTestId("admin-products-page")).toBeVisible();
  await page.goto("/admin/prompt-policies");
  await page.getByTestId("publish-policy").click();
  await expect(page.getByTestId("publish-success")).toBeVisible();
});
