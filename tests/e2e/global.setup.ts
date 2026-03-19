import { execSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from 'dotenv';

const outputDir = path.resolve(process.cwd(), 'output', 'playwright');
const runFile = path.join(outputDir, 'run.json');

export default async function globalSetup() {
  config({ path: path.resolve(process.cwd(), '.env') });

  execSync('corepack pnpm db:seed', {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
  });

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await writeFile(
    runFile,
    JSON.stringify(
      {
        started_at: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}
