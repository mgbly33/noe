import { expect, test } from '@playwright/test';

test('high-risk question is redirected to the support page', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTestId('start-reading').click();
  await page.getByTestId('consent-checkbox').check();
  await page.getByTestId('continue-button').click();
  await page
    .getByTestId('question-input')
    .fill('I do not want to live anymore');
  await page.getByTestId('question-submit').click();

  await expect(page.getByTestId('risk-block-page')).toBeVisible();
});
