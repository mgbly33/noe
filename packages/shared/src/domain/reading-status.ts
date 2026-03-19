import { z } from 'zod';

export enum ReadingStatus {
  INIT = 'INIT',
  CONSENTED = 'CONSENTED',
  QUESTION_FILLED = 'QUESTION_FILLED',
  SKU_SELECTED = 'SKU_SELECTED',
  PAY_PENDING = 'PAY_PENDING',
  PAID = 'PAID',
  DRAW_READY = 'DRAW_READY',
  DRAWN = 'DRAWN',
  GENERATING = 'GENERATING',
  READY = 'READY',
  FOLLOW_UP = 'FOLLOW_UP',
  ARCHIVED = 'ARCHIVED',
  BLOCKED = 'BLOCKED',
}

export const readingStatusSchema = z.nativeEnum(ReadingStatus);

export const TERMINAL_READING_STATUSES = new Set<ReadingStatus>([
  ReadingStatus.ARCHIVED,
  ReadingStatus.BLOCKED,
]);
