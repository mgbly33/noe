import { expect, test } from "@playwright/test";

test("high-risk question is redirected to the support page", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("theme-card-emotion-healing").click();
  await expect(page).toHaveURL(/\/auth\/login\?redirect=%2Fconsent/);
  await page.getByRole("link", { name: "还没有账户，去注册" }).click();
  await page
    .getByTestId("register-username")
    .fill(`risk_${Date.now().toString(36)}`);
  await page.getByTestId("register-password").fill("secret123");
  await page.getByTestId("register-confirm-password").fill("secret123");
  await page.getByTestId("register-submit").click();
  await expect(page).toHaveURL(/\/consent$/);
  await page.getByTestId("consent-checkbox").check();
  await page.getByTestId("continue-button").click();
  await page
    .getByTestId("question-input")
    .fill("I do not want to live anymore");
  await page.getByTestId("question-submit").click();

  await expect(page.getByTestId("risk-block-page")).toBeVisible();
});
