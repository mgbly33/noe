import { randomUUID } from 'node:crypto';

export const createBusinessId = (prefix: string) =>
  `${prefix}_${randomUUID().replace(/-/g, '')}`;
