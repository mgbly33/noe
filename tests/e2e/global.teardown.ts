import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from 'dotenv';

const runFile = path.resolve(process.cwd(), 'output', 'playwright', 'run.json');

export default async function globalTeardown() {
  config({ path: path.resolve(process.cwd(), '.env') });

  execSync('corepack pnpm db:seed', {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
  });

  try {
    const current = JSON.parse(await readFile(runFile, 'utf8')) as Record<
      string,
      unknown
    >;

    await writeFile(
      runFile,
      JSON.stringify(
        {
          ...current,
          finished_at: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
  } catch {
    // Ignore teardown write failures so test exit status reflects test results.
  }
}
