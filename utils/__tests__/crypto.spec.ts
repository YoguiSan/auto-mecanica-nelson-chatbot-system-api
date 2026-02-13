import { simpleSessionId } from '../crypto.ts';

describe('Crypto tests', () => {
  test('Generate a simple 36 characters key to be used as a session ID', () => {
    const Key = simpleSessionId();

    expect(Key).toBeDefined();

    expect(Key).toHaveLength(36);
  });
});
