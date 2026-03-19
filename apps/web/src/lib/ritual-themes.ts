export type TopicType = 'career' | 'emotion' | 'growth';

export type RitualThemeSlug =
  | 'emotion-healing'
  | 'self-growth'
  | 'relationship-repair'
  | 'future-direction'
  | 'energy-cleansing'
  | 'daily-guidance';

export type RitualTheme = {
  slug: RitualThemeSlug;
  label: string;
  topicType: TopicType;
  title: string;
  prompt: string;
  blurb: string;
};

export const RITUAL_THEMES: RitualTheme[] = [
  {
    slug: 'emotion-healing',
    label: '情绪疗愈',
    topicType: 'emotion',
    title: '安放此刻翻涌的情绪',
    prompt: '当心绪反复起伏时，先让牌面陪你看清真正的感受。',
    blurb: '适合梳理压抑、疲惫、心慌与情绪卡顿。',
  },
  {
    slug: 'self-growth',
    label: '自我成长',
    topicType: 'growth',
    title: '在混乱中重新看见自己',
    prompt: '把注意力从外界抽回到内心，找到下一步的成长方向。',
    blurb: '适合探索自我边界、内在课题与阶段性成长。',
  },
  {
    slug: 'relationship-repair',
    label: '关系修复',
    topicType: 'emotion',
    title: '温柔地理解关系里的失衡',
    prompt: '不急着判断谁对谁错，先看见彼此真正的需要。',
    blurb: '适合亲密关系、暧昧关系与重要人际连接。',
  },
  {
    slug: 'future-direction',
    label: '未来方向',
    topicType: 'career',
    title: '为眼前的分岔路找到方向感',
    prompt: '当选择很多却很难落定时，让牌面帮你梳理趋势与重点。',
    blurb: '适合事业、学业、转折决定与下一步规划。',
  },
  {
    slug: 'energy-cleansing',
    label: '能量净化',
    topicType: 'growth',
    title: '把缠绕的疲惫与内耗慢慢松开',
    prompt: '先停下来，让这次解读帮助你识别消耗与恢复的方式。',
    blurb: '适合恢复能量、整理状态与走出长期消耗。',
  },
  {
    slug: 'daily-guidance',
    label: '今日指引',
    topicType: 'growth',
    title: '给今天一个清晰而温柔的提醒',
    prompt: '不必一次解开所有问题，先收下当下最需要的那一句回应。',
    blurb: '适合短时困惑、日常校准与轻量陪伴。',
  },
];

export const getDefaultTheme = () => RITUAL_THEMES[0];

export const getThemeBySlug = (slug: RitualThemeSlug | string) =>
  RITUAL_THEMES.find((theme) => theme.slug === slug);

export const mapThemeToTopicType = (slug: RitualThemeSlug | string): TopicType =>
  getThemeBySlug(slug)?.topicType ?? getDefaultTheme().topicType;
