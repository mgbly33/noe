import { describe, expect, it } from 'vitest';

import { canTransition, ReadingStatus } from '../index';

describe('reading state machine', () => {
  it('allows PAID -> DRAW_READY but rejects INIT -> DRAW_READY', () => {
    expect(canTransition(ReadingStatus.PAID, ReadingStatus.DRAW_READY)).toBe(true);
    expect(canTransition(ReadingStatus.INIT, ReadingStatus.DRAW_READY)).toBe(false);
  });
});
