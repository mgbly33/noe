import { z } from 'zod';

import {
  createApiSuccessSchema,
  isoDateTimeSchema,
  nonEmptyStringSchema,
  orderIdSchema,
  sessionIdSchema,
  skuIdSchema,
} from './common';

export enum PaymentStatus {
  CREATED = 'CREATED',
  PAYING = 'PAYING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CLOSED = 'CLOSED',
}

export const paymentStatusSchema = z.nativeEnum(PaymentStatus);

export const createOrderRequestSchema = z.object({
  session_id: sessionIdSchema,
  sku_id: skuIdSchema,
  coupon_id: nonEmptyStringSchema.optional(),
  source: nonEmptyStringSchema.optional(),
});

export const createOrderResponseSchema = createApiSuccessSchema(
  z.object({
    order_id: orderIdSchema,
    amount: z.number().nonnegative(),
    discount_amount: z.number().nonnegative().default(0),
    payable_amount: z.number().nonnegative(),
    pay_status: paymentStatusSchema,
    expire_at: isoDateTimeSchema,
  }),
);
