import { z } from 'zod';

export enum Channel {
  MINIAPP = 'miniapp',
  H5 = 'h5',
}

export enum SpreadType {
  ONE_CARD = 'one_card',
  THREE_CARDS = 'three_cards',
}

export enum SkuType {
  FREE_TRIAL = 'free_trial',
  SINGLE = 'single',
  PACK = 'pack',
}

const createBusinessIdSchema = (prefix: string) =>
  z.string().regex(new RegExp(`^${prefix}_[A-Za-z0-9_-]+$`), `Expected ${prefix}_*`);

export const nonEmptyStringSchema = z.string().trim().min(1);
export const requestIdSchema = nonEmptyStringSchema;
export const userIdSchema = createBusinessIdSchema('usr');
export const sessionIdSchema = createBusinessIdSchema('qs');
export const skuIdSchema = createBusinessIdSchema('sku');
export const orderIdSchema = createBusinessIdSchema('ord');
export const readingIdSchema = createBusinessIdSchema('rd');
export const assetIdSchema = createBusinessIdSchema('ast');
export const isoDateTimeSchema = z.string().datetime({ offset: true });
export const channelSchema = z.nativeEnum(Channel);
export const spreadTypeSchema = z.nativeEnum(SpreadType);
export const skuTypeSchema = z.nativeEnum(SkuType);

export const apiErrorSchema = z.object({
  code: z.number().int().positive(),
  message: nonEmptyStringSchema,
  request_id: requestIdSchema.optional(),
});

export const createApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    code: z.literal(0),
    message: nonEmptyStringSchema.optional(),
    request_id: requestIdSchema.optional(),
    data: dataSchema,
  });

export type ApiError = z.infer<typeof apiErrorSchema>;
