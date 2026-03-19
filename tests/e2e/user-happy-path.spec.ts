import { expect, test } from "@playwright/test";

test("registered user completes the core paid flow and sees a result", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("theme-card-future-direction").click();
  await expect(page).toHaveURL(/\/auth\/login\?redirect=%2Fconsent/);
  await page.getByRole("link", { name: "还没有账户，去注册" }).click();
  await page
    .getByTestId("register-username")
    .fill(`flow_${Date.now().toString(36)}`);
  await page.getByTestId("register-password").fill("secret123");
  await page.getByTestId("register-confirm-password").fill("secret123");
  await page.getByTestId("register-submit").click();
  await expect(page).toHaveURL(/\/consent$/);
  await page.getByTestId("consent-checkbox").check();
  await page.getByTestId("continue-button").click();
  await page.getByTestId("question-input").fill("Should I switch jobs?");
  await page.getByTestId("question-submit").click();
  await page.getByTestId("sku-three-cards-single").click();
  await page.getByTestId("mock-pay-submit").click();

  await expect(page.getByTestId("result-summary")).toBeVisible();
});
