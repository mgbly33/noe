import { hashPassword, verifyPassword } from './password';

describe('password helpers', () => {
  it('hashes and verifies a password', () => {
    const hash = hashPassword('admin123456');

    expect(hash).not.toBe('admin123456');
    expect(verifyPassword('admin123456', hash)).toBe(true);
    expect(verifyPassword('wrong-password', hash)).toBe(false);
  });
});
