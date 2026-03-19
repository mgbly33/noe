'use client';

import Link from 'next/link';
import { startTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/common/app-shell';
import { ensureGuestSession } from '@/lib/auth/session';
import {
  getThemeBySlug,
  mapThemeToTopicType,
  RITUAL_THEMES,
  type RitualThemeSlug,
} from '@/lib/ritual-themes';
import {
  loadReadingFlow,
  resetReadingJourney,
  saveReadingFlow,
} from '@/lib/state/reading-flow';

const ritualSteps = [
  {
    title: '先选与你状态最贴近的主题',
    description: '不急着回答全部人生，只先确认这一次最需要被照见的部分。',
  },
  {
    title: '写下此刻真正想问的问题',
    description: '系统会先做边界检查，再为你匹配合适的牌阵与解读深度。',
  },
  {
    title: '得到回应，并在需要时继续追问',
    description: '结果页会保留核心讯息、牌面展开与后续行动提醒。',
  },
] as const;

const sanctuaryPromises = [
  '先确认边界与隐私说明，再开始本次解读。',
  '遇到高风险内容时会停止占卜流程，并提示你优先寻求现实支持。',
  '你的最近一次 reading 会被保留，方便回看与继续追问。',
] as const;

const readingOutputs = [
  {
    title: '核心讯息',
    description: '先给你一句最需要被听见的回应，不让重点淹没在长文里。',
  },
  {
    title: '牌面展开',
    description: '逐张解释牌义、位置与正逆位，让抽到的内容更具体。',
  },
  {
    title: '行动提醒',
    description: '把抽象感受落到接下来可以尝试的观察与行动上。',
  },
] as const;

export default function HomePage() {
  const router = useRouter();
  const [pendingTheme, setPendingTheme] = useState<RitualThemeSlug | null>(null);
  const [error, setError] = useState('');
  const [readingId, setReadingId] = useState<string | undefined>();

  useEffect(() => {
    setReadingId(loadReadingFlow().reading_id);
  }, []);

  const beginJourney = async (slug: RitualThemeSlug) => {
    setPendingTheme(slug);
    setError('');

    try {
      const selectedTheme = getThemeBySlug(slug);
      resetReadingJourney();
      saveReadingFlow({
        entry_theme: slug,
        topic_type: mapThemeToTopicType(slug),
      });
      await ensureGuestSession();

      if (!selectedTheme) {
        throw new Error('无法识别当前主题，请重新选择。');
      }

      startTransition(() => {
        router.push('/consent');
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : '暂时无法进入本次解读，请稍后再试。',
      );
    } finally {
      setPendingTheme(null);
    }
  };

  return (
    <AppShell variant="home">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">神圣并不喧哗，回应可以温柔抵达。</p>
          <h1>在抽牌之前，先让自己被安静地接住。</h1>
          <p className="lede">
            这里不是仓促给答案的工具，而是一段从主题、问题到解读结果的完整仪式。
            你只需要从此刻最贴近自己的主题开始。
          </p>
          <div className="hero-actions">
            {readingId ? (
              <Link
                href={`/reading/${readingId}`}
                className="secondary-button link-button"
              >
                继续上次解读
              </Link>
            ) : null}
            <Link href="/history" className="ghost-button link-button">
              查看解读档案
            </Link>
          </div>
        </div>

        <div className="home-altar panel-card">
          <div className="altar-mark">NOE ARCANA</div>
          <p className="oracle-kicker">Before The Cards</p>
          <h2>你此刻想被照见哪一面？</h2>
          <p>
            先从一个明确的主题入口进入，再把问题交给牌面，整段体验会更聚焦，也更像一次真正的陪伴。
          </p>
          <div className="altar-badges">
            <span>主题先行</span>
            <span>边界清晰</span>
            <span>可继续追问</span>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <p className="eyebrow">Theme Entrance</p>
          <h2>选择本次最贴近你的占卜主题</h2>
          <p className="muted-text">
            主页不直接催促你抽牌，而是先让你进入更准确的情绪场景。
          </p>
        </div>

        <div className="theme-grid">
          {RITUAL_THEMES.map((theme, index) => {
            const isPending = pendingTheme === theme.slug;

            return (
              <button
                key={theme.slug}
                type="button"
                className="theme-card"
                data-testid={`theme-card-${theme.slug}`}
                onClick={() => void beginJourney(theme.slug)}
                disabled={pendingTheme !== null}
              >
                <span className="theme-index">{`0${index + 1}`}</span>
                <div className="theme-card-copy">
                  <span className="theme-card-label">{theme.label}</span>
                  <h3>{theme.title}</h3>
                  <p>{theme.blurb}</p>
                </div>
                <span className="theme-card-cta">
                  {isPending ? '进入中…' : '进入仪式'}
                </span>
              </button>
            );
          })}
        </div>

        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="home-section home-panel">
        <div className="section-heading">
          <p className="eyebrow">How It Holds You</p>
          <h2>这次解读会如何陪你走完整个过程</h2>
        </div>
        <div className="ritual-steps">
          {ritualSteps.map((step, index) => (
            <article key={step.title} className="ritual-step-card">
              <span className="theme-index">{`0${index + 1}`}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-two-column">
        <div className="panel-card sanctuary-card">
          <p className="eyebrow">Boundary & Trust</p>
          <h2>开始之前，先把边界讲清楚</h2>
          <ul className="bullet-list">
            {sanctuaryPromises.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="panel-card sanctuary-card">
          <p className="eyebrow">What You Receive</p>
          <h2>本次结果不会只给你一句笼统的话</h2>
          <div className="output-list">
            {readingOutputs.map((item) => (
              <article key={item.title} className="output-card">
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
