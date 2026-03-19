import { describe, expect, it } from 'vitest';

import { createOrderRequestSchema, evaluateQuestionRisk, RiskLevel } from '../index';

describe('risk contracts', () => {
  it('blocks explicit self-harm phrases', () => {
    expect(
      evaluateQuestionRisk('I do not want to live anymore'),
    ).toMatchObject({
      level: RiskLevel.BLOCK,
    });
  });

  it('passes ordinary life questions', () => {
    expect(evaluateQuestionRisk('Should I switch jobs this year?')).toMatchObject({
      level: RiskLevel.LOW,
    });
  });

  it('rejects missing sku_id', () => {
    expect(() => createOrderRequestSchema.parse({ session_id: 'qs_1' })).toThrow();
  });
});
