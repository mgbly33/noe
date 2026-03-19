import { z } from 'zod';

import { Channel, channelSchema, createApiSuccessSchema, nonEmptyStringSchema, readingIdSchema, sessionIdSchema, skuIdSchema } from './common';
import { RiskLevel, RiskTag, riskLevelSchema, riskTagSchema } from '../domain/risk';
import { ReadingStatus, readingStatusSchema } from '../domain/reading-status';

export const topicTypeSchema = nonEmptyStringSchema;
export const questionTextSchema = z.string().trim().min(1).max(500);

export const questionRiskCheckRequestSchema = z.object({
  question_text: questionTextSchema,
  topic_type: topicTypeSchema,
});

export const questionRiskCheckResponseSchema = createApiSuccessSchema(
  z.object({
    risk_level: riskLevelSchema,
    risk_tags: z.array(riskTagSchema).default([]),
  }),
);

export const createQuestionSessionRequestSchema = z.object({
  topic_type: topicTypeSchema,
  question_text: questionTextSchema,
  entry_channel: channelSchema.default(Channel.H5),
});

export const createQuestionSessionResponseSchema = createApiSuccessSchema(
  z.object({
    session_id: sessionIdSchema,
    risk_level: z.nativeEnum(RiskLevel),
    recommended_skus: z.array(skuIdSchema).default([]),
  }),
);

export const readingSummarySchema = z.object({
  reading_id: readingIdSchema,
  session_id: sessionIdSchema,
  reading_status: readingStatusSchema,
  risk_level: riskLevelSchema,
});

export const createReadingRequestSchema = z.object({
  session_id: sessionIdSchema,
});

export const createReadingResponseSchema = createApiSuccessSchema(readingSummarySchema);

export const drawReadingRequestSchema = z.object({
  reversed_enabled: z.boolean().default(false),
});

export const drawReadingResponseSchema = createApiSuccessSchema(
  readingSummarySchema.extend({
    reading_status: z.literal(ReadingStatus.DRAWN),
  }),
);

export const generateReadingRequestSchema = z.object({
  style: z.enum(['gentle', 'direct', 'healing']).default('gentle'),
  disclaimer_version: nonEmptyStringSchema,
});

export const generateReadingResponseSchema = createApiSuccessSchema(
  readingSummarySchema.extend({
    reading_status: z.literal(ReadingStatus.READY),
    structured_result: z.record(z.string(), z.unknown()),
    final_text: nonEmptyStringSchema.optional(),
  }),
);

export const followUpRequestSchema = z.object({
  message: z.string().trim().min(1).max(500),
});

export const historyResponseSchema = createApiSuccessSchema(
  z.object({
    items: z.array(readingSummarySchema),
  }),
);

export type QuestionRiskCheckRequest = z.infer<typeof questionRiskCheckRequestSchema>;
export type CreateQuestionSessionRequest = z.infer<typeof createQuestionSessionRequestSchema>;
export type CreateReadingRequest = z.infer<typeof createReadingRequestSchema>;
export type DrawReadingRequest = z.infer<typeof drawReadingRequestSchema>;
export type GenerateReadingRequest = z.infer<typeof generateReadingRequestSchema>;
export type FollowUpRequest = z.infer<typeof followUpRequestSchema>;
