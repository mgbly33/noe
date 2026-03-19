import { defineConfig, devices } from '@playwright/test';

const apiCommand = 'corepack pnpm --dir apps/api exec nest start';
const webCommand =
  'corepack pnpm --dir apps/web exec next dev --webpack --hostname 127.0.0.1 --port 3000';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  workers: 1,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'dot' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: [
    {
      command: apiCommand,
      port: 3001,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: webCommand,
      port: 3000,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: {
        NEXT_PUBLIC_API_BASE_URL: 'http://127.0.0.1:3001',
      },
    },
  ],
});
