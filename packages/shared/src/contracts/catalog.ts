import { z } from 'zod';

import {
  createApiSuccessSchema,
  isoDateTimeSchema,
  nonEmptyStringSchema,
  skuIdSchema,
  skuTypeSchema,
  spreadTypeSchema,
} from './common';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export const productStatusSchema = z.nativeEnum(ProductStatus);

export const productSkuSchema = z.object({
  sku_id: skuIdSchema,
  sku_type: skuTypeSchema,
  spread_type: spreadTypeSchema,
  price: z.number().nonnegative(),
  title: nonEmptyStringSchema,
  benefits: z.array(nonEmptyStringSchema).default([]),
  status: productStatusSchema,
  updated_at: isoDateTimeSchema.optional(),
});

export const productListResponseSchema = createApiSuccessSchema(
  z.object({
    items: z.array(productSkuSchema),
  }),
);
