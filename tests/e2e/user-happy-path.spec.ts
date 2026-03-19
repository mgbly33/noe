import { expect, test } from '@playwright/test';

test('guest user completes the core paid flow and sees a result', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTestId('start-reading').click();
  await page.getByTestId('consent-checkbox').check();
  await page.getByTestId('continue-button').click();
  await page.getByTestId('question-input').fill('Should I switch jobs?');
  await page.getByTestId('question-submit').click();
  await page.getByTestId('sku-three-cards-single').click();
  await page.getByTestId('mock-pay-submit').click();

  await expect(page.getByTestId('result-summary')).toBeVisible();
});
