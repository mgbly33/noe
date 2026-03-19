'use client';

import { startTransition, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/common/app-shell';
import { ensureGuestSession } from '@/lib/auth/session';
import { loadReadingFlow, resetReadingJourney } from '@/lib/state/reading-flow';

export default function HomePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [readingId, setReadingId] = useState<string | undefined>();

  useEffect(() => {
    setReadingId(loadReadingFlow().reading_id);
  }, []);

  const start = async () => {
    setBusy(true);

    try {
      resetReadingJourney();
      await ensureGuestSession();
      startTransition(() => {
        router.push('/consent');
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell
      eyebrow="Reflective Reading"
      title="把一次付费塔罗体验，压缩成一条可恢复的移动端路径。"
      description="从 consent 到支付、抽牌、结果、追问与历史，全部围绕一个问题线索推进。你只需要开始，系统会把状态稳稳接住。"
      aside={
        <div className="oracle-note">
          <span className="oracle-kicker">P0 Journey</span>
          <h2>一条短路径，串起真实业务状态。</h2>
          <p>
            Guest 登录、风险拦截、商品推荐、mock 支付、reading 生成和追问，都已经接进后端接口。
          </p>
        </div>
      }
    >
      <div className="hero-actions">
        <button
          type="button"
          className="primary-button large"
          data-testid="start-reading"
          onClick={start}
          disabled={busy}
        >
          {busy ? '准备中...' : '开始本次解读'}
        </button>
        <Link href="/history" className="ghost-button link-button">
          查看历史
        </Link>
        {readingId ? (
          <Link
            href={`/reading/${readingId}`}
            className="secondary-button link-button"
          >
            继续上次结果
          </Link>
        ) : null}
      </div>

      <div className="feature-strip">
        <article className="feature-card">
          <strong>风险先行</strong>
          <p>高风险问题会在进入购买前被拦下，不继续后续流程。</p>
        </article>
        <article className="feature-card">
          <strong>支付后锁权益</strong>
          <p>支付成功不等于立刻消费，reading 成功生成后才会真正扣除。</p>
        </article>
        <article className="feature-card">
          <strong>可以恢复</strong>
          <p>浏览器会记住最近一次 order 与 reading，刷新后还能续上。</p>
        </article>
      </div>
    </AppShell>
  );
}
