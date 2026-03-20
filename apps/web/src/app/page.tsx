'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useEffect, useState } from 'react';

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

const tarotWindows = [
  {
    title: '情绪、关系与反复出现的卡点',
    description:
      '塔罗更擅长把那些说不清、却一直在心里盘旋的情绪与关系模式摊开给你看。',
  },
  {
    title: '站在人生分岔口时的真实拉扯',
    description:
      '当你明明知道自己该往前，却还在犹豫和摇摆，牌面能帮助你看清阻力来自哪里。',
  },
  {
    title: '那些被理性压住的直觉与提醒',
    description:
      '有些答案不是没有，而是被疲惫、恐惧和自我怀疑盖住了，塔罗会把它们慢慢翻出来。',
  },
] as const;

const questionGuides = [
  {
    title: '先问一件事，不要一次追问整个人生',
    description:
      '比起“我到底该怎么办”，塔罗更适合回应“这段关系里我忽略了什么”或“我现在最该看见哪一步”。',
  },
  {
    title: '把时间、对象和处境说清楚',
    description:
      '问题越贴近真实场景，牌面给出的回应就越具体，也越容易和你当下的处境发生连接。',
  },
  {
    title: '把塔罗当成照见，不是替你拍板',
    description:
      '它适合帮助你理解局面、情绪和趋势，但不应该替代现实中的重要安全判断与专业支持。',
  },
] as const;

const featuredArcana = [
  {
    title: '女祭司',
    english: 'The High Priestess',
    image: '/images/tarot/high-priestess.jpg',
    alt: '塔罗牌女祭司 The High Priestess',
    description: '她提醒你安静下来，听见那些还没被说出口、却已经在心里成形的感受。',
  },
  {
    title: '星星',
    english: 'The Star',
    image: '/images/tarot/star.jpg',
    alt: '塔罗牌星星 The Star',
    description: '当你有些疲惫、又还想继续相信时，星星会把微弱但真实的希望重新点亮。',
  },
  {
    title: '月亮',
    english: 'The Moon',
    image: '/images/tarot/moon.jpg',
    alt: '塔罗牌月亮 The Moon',
    description: '它让你看见夜里的不安、投射与迷雾，也提醒你分辨直觉和恐惧的边界。',
  },
] as const;

const sanctuaryPromises = [
  '塔罗适合照见处境，不替代现实中的重要决定与安全判断。',
  '遇到高风险内容时会停止占卜流程，并提示你优先寻求现实支持。',
  '你的最近一次解读会被保留，方便回看与继续追问。',
] as const;

const readingOutputs = [
  {
    title: '核心讯息',
    description: '先告诉你此刻最值得正视的主题，不让重点被长段解释淹没。',
  },
  {
    title: '牌面展开',
    description: '逐张解释牌义、位置关系与气氛变化，让你知道为什么会得到这样的回应。',
  },
  {
    title: '行动线索',
    description: '把抽象的感受落到下一步能观察、能尝试、能回看的现实线索上。',
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
          <p className="eyebrow">Tarot As Mirror</p>
          <h1>塔罗不会替你决定人生，但会帮你看清此刻</h1>
          <p className="lede">
            塔罗更像一面温柔的镜子。它不会替你下命令，却能把情绪、关系、选择与反复出现的课题安静地摊开，
            让你看见自己正站在哪个位置。
          </p>
          <p className="hero-note">
            从最贴近你的主题进入，再把问题交给牌面，回应通常会更清晰，也更接近你真正想确认的那件事。
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

        <div
          className="home-altar hero-tarot-collage panel-card"
          data-testid="hero-tarot-collage"
        >
          <div className="collage-halo halo-one" />
          <div className="collage-halo halo-two" />
          <div className="collage-stars" />
          <div className="collage-head">
            <div>
              <div className="altar-mark">Rider-Waite-Smith</div>
              <p className="oracle-kicker">Featured Arcana</p>
            </div>
            <p className="collage-copy">
              真实牌面负责说话，象征与夜色只负责把它们轻轻托住。
            </p>
          </div>
          <div className="collage-stack" aria-hidden="true">
            {featuredArcana.map((card, index) => (
              <article
                key={card.english}
                className={`hero-tarot-card hero-tarot-card-${index + 1}`}
              >
                <div className="hero-tarot-frame">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    width={320}
                    height={560}
                    className="hero-tarot-image"
                    sizes="(max-width: 760px) 34vw, 180px"
                  />
                </div>
                <div className="hero-tarot-meta">
                  <strong>{card.title}</strong>
                  <span>{card.english}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <p className="eyebrow">Theme Entrance</p>
          <h2>从你最想照见的主题开始</h2>
          <p className="muted-text">
            先确定此刻真正想问的处境，牌面给出的回应会更贴近你当下的真实状态。
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
          <p className="eyebrow">What Tarot Reveals</p>
          <h2>塔罗更擅长照见的，往往不是表面答案</h2>
        </div>
        <div className="ritual-steps">
          {tarotWindows.map((item, index) => (
            <article key={item.title} className="ritual-step-card">
              <span className="theme-index">{`0${index + 1}`}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-panel">
        <div className="section-heading">
          <p className="eyebrow">How To Ask</p>
          <h2>让塔罗更好回应你的三个提问方式</h2>
        </div>
        <div className="ritual-steps">
          {questionGuides.map((item, index) => (
            <article key={item.title} className="ritual-step-card">
              <span className="theme-index">{`0${index + 1}`}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-panel">
        <div className="section-heading">
          <p className="eyebrow">Arcana Glimpse</p>
          <h2>三张常常陪伴初访者的牌面</h2>
          <p className="muted-text">
            它们并不是固定答案，而是三种很常见的进入方式：直觉、希望，以及对迷雾的辨认。
          </p>
        </div>
        <div className="tarot-gallery">
          {featuredArcana.map((card) => (
            <article key={card.english} className="tarot-gallery-card">
              <div className="tarot-gallery-image-wrap">
                <Image
                  src={card.image}
                  alt={card.alt}
                  width={420}
                  height={720}
                  className="tarot-gallery-image"
                  sizes="(max-width: 760px) 78vw, (max-width: 1120px) 28vw, 22vw"
                />
              </div>
              <div className="tarot-gallery-copy">
                <p className="tarot-gallery-kicker">{card.english}</p>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-two-column">
        <div className="panel-card sanctuary-card">
          <p className="eyebrow">Boundary & Care</p>
          <h2>塔罗不是替现实做决定的捷径</h2>
          <ul className="bullet-list">
            {sanctuaryPromises.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="panel-card sanctuary-card">
          <p className="eyebrow">Reading Layers</p>
          <h2>一次解读通常会这样展开</h2>
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
