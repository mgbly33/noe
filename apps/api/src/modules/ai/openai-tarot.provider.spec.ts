import OpenAI from 'openai';

import { OpenAiTarotProvider } from './openai-tarot.provider';

const mockCreate = jest.fn();

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    responses: {
      create: mockCreate,
    },
  })),
}));

describe('OpenAiTarotProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockReset();
    process.env = {
      ...originalEnv,
      OPENAI_API_KEY: 'your-api-key-1',
      OPENAI_MODEL: 'gpt-5.4',
      OPENAI_BASE_URL: 'http://localhost:8317',
      OPENAI_REASONING_EFFORT: 'medium',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('normalizes the base url and maps reading output into persisted fields', async () => {
    mockCreate.mockResolvedValue({
      output_text: JSON.stringify({
        theme: '看清此刻真正牵动你的核心关系',
        summary: '现在最重要的不是立刻做决定，而是先辨认情绪里的牵引。',
        guidance: ['先稳定情绪', '辨认阻力来源', '用一次小行动验证方向'],
        final_text:
          '这次牌面更像是在提醒你，先看清关系中的真实拉扯，再决定下一步如何行动。',
      }),
      usage: {
        input_tokens: 123,
        output_tokens: 234,
      },
    });

    const provider = new OpenAiTarotProvider();
    const result = await provider.generateReading({
      questionText: '我该怎么处理这段关系里的反复拉扯？',
      style: 'gentle',
      cards: [
        {
          card_id: 'card_1',
          card_name: 'The High Priestess',
          position: 1,
          orientation: 'upright',
        },
        {
          card_id: 'card_2',
          card_name: 'The Star',
          position: 2,
          orientation: 'upright',
        },
      ],
      promptTemplate: {
        system: 'You are a calm tarot guide.',
        interpretation_style: 'gentle and practical',
      },
      policyVersion: 'prompt_policy_v1',
      modelRouteCode: 'mock-provider-v1',
    });

    expect(OpenAI as unknown as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'your-api-key-1',
        baseURL: 'http://localhost:8317/v1',
      }),
    );
    const [createRequest] = mockCreate.mock.calls[0] as [
      { model?: string; instructions?: string },
    ];

    expect(createRequest.model).toBe('gpt-5.4');
    expect(createRequest.instructions).toContain('You are a calm tarot guide.');
    expect(result).toMatchObject({
      modelVendor: 'openai',
      modelVersion: 'gpt-5.4',
      promptVersion: 'prompt_policy_v1',
      policyVersion: 'prompt_policy_v1',
      safetyResult: 'PASS',
      tokenInput: 123,
      tokenOutput: 234,
      structuredResult: {
        theme: '看清此刻真正牵动你的核心关系',
        summary: '现在最重要的不是立刻做决定，而是先辨认情绪里的牵引。',
        guidance: ['先稳定情绪', '辨认阻力来源', '用一次小行动验证方向'],
        cards: [
          {
            card_id: 'card_1',
            card_name: 'The High Priestess',
            position: 1,
            orientation: 'upright',
          },
          {
            card_id: 'card_2',
            card_name: 'The Star',
            position: 2,
            orientation: 'upright',
          },
        ],
      },
      finalText:
        '这次牌面更像是在提醒你，先看清关系中的真实拉扯，再决定下一步如何行动。',
    });
  });

  it('parses fenced json for follow-up replies', async () => {
    mockCreate.mockResolvedValue({
      output_text:
        '```json\n{"reply":"如果你继续沿着这条关系推进，先别急着求结果，先看见彼此真正害怕失去的是什么。"}\n```',
    });

    const provider = new OpenAiTarotProvider();
    const result = await provider.generateFollowUp({
      questionText: '如果我继续推进这段关系，会发生什么？',
      replyContext: '当前牌面提示需要先辨认情绪中的不安，再决定是否继续投入。',
    });

    expect(result).toEqual({
      reply:
        '如果你继续沿着这条关系推进，先别急着求结果，先看见彼此真正害怕失去的是什么。',
      modelVendor: 'openai',
      modelVersion: 'gpt-5.4',
    });
  });
});
