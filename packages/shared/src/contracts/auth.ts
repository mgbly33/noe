import { z } from 'zod';

import { channelSchema, createApiSuccessSchema, nonEmptyStringSchema, userIdSchema } from './common';

export enum LoginType {
  WECHAT_CODE = 'wechat_code',
  GUEST = 'guest',
}

export const loginTypeSchema = z.nativeEnum(LoginType);

export const loginRequestSchema = z
  .object({
    login_type: loginTypeSchema,
    code: z.string().trim().optional(),
    device_id: nonEmptyStringSchema,
    channel: channelSchema,
  })
  .superRefine((value, ctx) => {
    if (value.login_type === LoginType.WECHAT_CODE && !value.code) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['code'],
        message: 'code is required for wechat_code login',
      });
    }
  });

export const loginResponseSchema = createApiSuccessSchema(
  z.object({
    user_id: userIdSchema,
    token: nonEmptyStringSchema,
    need_consent: z.boolean(),
    role: z.enum(['guest', 'user', 'admin']).default('guest'),
  }),
);
