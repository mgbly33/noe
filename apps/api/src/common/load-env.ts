import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { config } from 'dotenv';

let loaded = false;

export const loadEnv = () => {
  if (loaded) {
    return;
  }

  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      config({ path: candidate });
      loaded = true;
      return;
    }
  }

  config();
  loaded = true;
};
