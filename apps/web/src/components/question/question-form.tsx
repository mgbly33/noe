'use client';

import Link from 'next/link';

import {
  getDefaultTheme,
  getThemeBySlug,
  RITUAL_THEMES,
  type RitualThemeSlug,
} from '@/lib/ritual-themes';

type QuestionFormProps = {
  question: string;
  themeSlug: RitualThemeSlug;
  pending: boolean;
  blocked: boolean;
  error: string;
  onQuestionChange: (value: string) => void;
  onThemeChange: (value: RitualThemeSlug) => void;
  onSubmit: () => void;
};

const placeholders: Record<RitualThemeSlug, string> = {
  'emotion-healing': '例如：为什么我最近总是陷在同一种情绪里，应该先照顾哪里？',
  'self-growth': '例如：我现在最该突破的内在卡点是什么？',
  'relationship-repair': '例如：这段关系还能否被修复？我应该先看见什么？',
  'future-direction': '例如：我该继续现在的方向，还是准备转向新的机会？',
  'energy-cleansing': '例如：最近让我持续消耗的来源是什么，我该如何恢复状态？',
  'daily-guidance': '例如：今天的我最需要记住的提醒是什么？',
};

const examples: Record<RitualThemeSlug, string[]> = {
  'emotion-healing': ['最近这份难过真正指向的是什么？', '我该怎么安放反复出现的焦虑？'],
  'self-growth': ['我下一阶段最重要的成长课题是什么？', '我为什么总在同样的地方犹豫？'],
  'relationship-repair': ['这段关系真正的问题核心是什么？', '我该如何更稳地回应对方与自己？'],
  'future-direction': ['这次选择里最值得我重视的信号是什么？', '哪条路更符合我的长期方向？'],
  'energy-cleansing': ['我现在最主要的能量泄漏点在哪里？', '怎样调整才能慢慢恢复稳定？'],
  'daily-guidance': ['今天最适合我做的一件事是什么？', '此刻我最需要提醒自己的是什么？'],
};

export function QuestionForm({
  question,
  themeSlug,
  pending,
  blocked,
  error,
  onQuestionChange,
  onThemeChange,
  onSubmit,
}: QuestionFormProps) {
  const activeTheme = getThemeBySlug(themeSlug) ?? getDefaultTheme();

  if (blocked) {
    return (
      <div className="panel-card support-card support-panel" data-testid="risk-block-page">
        <p className="eyebrow">Support First</p>
        <h2>这条问题触发了高风险保护</h2>
        <p className="muted-text">
          当前页面不会继续占卜流程。请优先联系身边可信任的人，或尽快寻求线下专业支持与紧急帮助。
        </p>
        <div className="action-row">
          <Link href="/" className="secondary-button link-button">
            返回首页
          </Link>
          <Link href="/history" className="ghost-button link-button">
            查看已有记录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-card form-panel">
      <div className="panel-head panel-head-start">
        <div>
          <p className="eyebrow">Question Ritual</p>
          <h2>{activeTheme.label}</h2>
        </div>
        <span className="status-pill">当前主题</span>
      </div>

      <p className="muted-text">{activeTheme.prompt}</p>

      <div className="theme-chip-grid">
        {RITUAL_THEMES.map((item) => (
          <button
            key={item.slug}
            type="button"
            className={
              item.slug === themeSlug
                ? 'question-theme-chip active'
                : 'question-theme-chip'
            }
            onClick={() => onThemeChange(item.slug)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="info-grid">
        <article className="info-card">
          <strong>适合这样开口</strong>
          <ul className="bullet-list">
            {examples[activeTheme.slug].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="info-card">
          <strong>提问小提醒</strong>
          <p>
            问题越具体，回应越聚焦。可以写下此刻最想确认的一件事，而不是一次解决所有困惑。
          </p>
        </article>
      </div>

      <label className="field-label" htmlFor="question-input">
        把此刻最想被回应的那句话写下来
      </label>
      <textarea
        id="question-input"
        data-testid="question-input"
        className="text-area"
        rows={6}
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        placeholder={placeholders[activeTheme.slug]}
      />

      {error ? <p className="error-text">{error}</p> : null}

      <button
        type="button"
        className="primary-button"
        data-testid="question-submit"
        onClick={onSubmit}
        disabled={pending || question.trim().length === 0}
      >
        {pending ? '正在为你整理问题…' : '继续进入牌阵选择'}
      </button>
    </div>
  );
}
