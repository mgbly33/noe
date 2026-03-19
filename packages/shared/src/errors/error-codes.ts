export const ERROR_CODES = {
  UNAUTHORIZED: 40003,
  CONSENT_REQUIRED: 40013,
  SKU_UNAVAILABLE: 40029,
  ENTITLEMENT_INSUFFICIENT: 40035,
  RISK_BLOCKED: 40051,
  RISK_DOWNGRADED: 40052,
  PAYMENT_PROCESSING: 50010,
  GENERATION_FAILED: 50021,
  IDEMPOTENCY_CONFLICT: 50022,
  INTERNAL_ERROR: 50050,
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ERROR_CODE_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.UNAUTHORIZED]: 'Unauthorized or expired login session.',
  [ERROR_CODES.CONSENT_REQUIRED]: 'Consent must be accepted before continuing.',
  [ERROR_CODES.SKU_UNAVAILABLE]: 'The selected product is not available.',
  [ERROR_CODES.ENTITLEMENT_INSUFFICIENT]: 'No entitlement is available for this action.',
  [ERROR_CODES.RISK_BLOCKED]: 'The request was blocked by risk policy.',
  [ERROR_CODES.RISK_DOWNGRADED]: 'The request must use a downgraded policy path.',
  [ERROR_CODES.PAYMENT_PROCESSING]: 'Payment is still processing.',
  [ERROR_CODES.GENERATION_FAILED]: 'Reading generation failed.',
  [ERROR_CODES.IDEMPOTENCY_CONFLICT]: 'The request conflicts with an existing idempotent record.',
  [ERROR_CODES.INTERNAL_ERROR]: 'The system encountered an unexpected error.',
};
