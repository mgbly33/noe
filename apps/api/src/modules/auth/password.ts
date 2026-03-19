import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const digest = scryptSync(password, salt, KEY_LENGTH).toString('hex');

  return `${salt}:${digest}`;
};

export const verifyPassword = (password: string, storedHash: string) => {
  const [salt, expectedDigest] = storedHash.split(':');

  if (!salt || !expectedDigest) {
    return false;
  }

  const actualDigest = scryptSync(password, salt, KEY_LENGTH);
  const expectedBuffer = Buffer.from(expectedDigest, 'hex');

  if (actualDigest.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualDigest, expectedBuffer);
};
