import { randomUUID } from 'crypto';

export function simpleSessionId(): string {
  return randomUUID(); // 36 chars, cryptographically secure
}