import { z } from 'zod';

import { createApiSuccessSchema, isoDateTimeSchema, nonEmptyStringSchema } from './common';

export const consentVersionSchema = nonEmptyStringSchema;

export const latestConsentSchema = createApiSuccessSchema(
  z.object({
    privacy_version: consentVersionSchema,
    disclaimer_version: consentVersionSchema,
    ai_notice_version: consentVersionSchema,
    age_notice_version: consentVersionSchema,
    updated_at: isoDateTimeSchema.optional(),
  }),
);

export const acceptConsentRequestSchema = z.object({
  privacy_version: consentVersionSchema,
  disclaimer_version: consentVersionSchema,
  ai_notice_version: consentVersionSchema,
  age_notice_version: consentVersionSchema,
  accepted: z.literal(true),
});

export const acceptConsentResponseSchema = createApiSuccessSchema(
  z.object({
    accepted: z.literal(true),
    accepted_at: isoDateTimeSchema.optional(),
  }),
);
