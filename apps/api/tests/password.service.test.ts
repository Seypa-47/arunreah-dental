import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../src/services/password.service';

describe('password service', () => {
  it('hashes passwords without retaining the plaintext and verifies valid credentials', async () => {
    const password = 'a-secure-test-password';
    const hash = await hashPassword(password);

    expect(hash).not.toContain(password);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password and malformed stored hash', async () => {
    const hash = await hashPassword('a-secure-test-password');

    await expect(verifyPassword('incorrect-password', hash)).resolves.toBe(false);
    await expect(verifyPassword('a-secure-test-password', 'invalid')).resolves.toBe(false);
  });
});
