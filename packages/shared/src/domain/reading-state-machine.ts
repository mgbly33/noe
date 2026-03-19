import { ReadingStatus } from './reading-status';

export const READING_TRANSITIONS: Record<ReadingStatus, readonly ReadingStatus[]> = {
  [ReadingStatus.INIT]: [ReadingStatus.CONSENTED, ReadingStatus.BLOCKED],
  [ReadingStatus.CONSENTED]: [ReadingStatus.QUESTION_FILLED, ReadingStatus.BLOCKED],
  [ReadingStatus.QUESTION_FILLED]: [ReadingStatus.SKU_SELECTED, ReadingStatus.BLOCKED],
  [ReadingStatus.SKU_SELECTED]: [ReadingStatus.PAY_PENDING, ReadingStatus.PAID, ReadingStatus.BLOCKED],
  [ReadingStatus.PAY_PENDING]: [ReadingStatus.PAID, ReadingStatus.ARCHIVED, ReadingStatus.BLOCKED],
  [ReadingStatus.PAID]: [ReadingStatus.DRAW_READY, ReadingStatus.ARCHIVED],
  [ReadingStatus.DRAW_READY]: [ReadingStatus.DRAWN, ReadingStatus.BLOCKED],
  [ReadingStatus.DRAWN]: [ReadingStatus.GENERATING, ReadingStatus.ARCHIVED],
  [ReadingStatus.GENERATING]: [ReadingStatus.READY, ReadingStatus.BLOCKED],
  [ReadingStatus.READY]: [ReadingStatus.FOLLOW_UP, ReadingStatus.ARCHIVED],
  [ReadingStatus.FOLLOW_UP]: [ReadingStatus.FOLLOW_UP, ReadingStatus.ARCHIVED],
  [ReadingStatus.ARCHIVED]: [],
  [ReadingStatus.BLOCKED]: [ReadingStatus.ARCHIVED],
};

export const canTransition = (from: ReadingStatus, to: ReadingStatus) =>
  READING_TRANSITIONS[from].includes(to);
