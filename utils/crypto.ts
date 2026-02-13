import { randomUUID } from 'crypto';

export function simpleSessionId(): string {
  return randomUUID();
}