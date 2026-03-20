'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { ReadingDetail } from '@/lib/api/client';
import { getTarotCardArt } from '@/lib/tarot/tarot-card-art';

type ReadingResultProps = {
  reading: ReadingDetail;
  themeLabel: string;
};

export function ReadingResult({ reading, themeLabel }: ReadingResultProps) {
  const summary =
    reading.interpretation?.structured_result.summary ??
    '系统已经整理好本次牌面的核心主题。';
  const guidance = reading.interpretation?.structured_result.guidance ?? [];

  return (
    <div className="result-layout">
      <section
        className="panel-card result-hero-card"
        data-testid="result-summary"
      >
        <p className="eyebrow">Reading Ready</p>
        <h2>{reading.interpretation?.structured_result.theme ?? '本次解读结果'}</h2>
        <p className="lede compact">{summary}</p>

        <div className="summary-grid summary-grid-stack">
          <div>
            <dt>解读主题</dt>
            <dd>{themeLabel}</dd>
          </div>
          <div>
            <dt>当前状态</dt>
            <dd>{reading.reading_status}</dd>
          </div>
          <div>
            <dt>牌阵类型</dt>
            <dd>{reading.spread_type.replace('_', ' ')}</dd>
          </div>
        </div>

        <p className="result-text">{reading.interpretation?.final_text}</p>
      </section>

      <section className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Cards</p>
            <h3>这次抽到的牌面</h3>
          </div>
          <span className="status-pill">{reading.reading_status}</span>
        </div>

        <div className="draw-grid">
          {reading.draw?.cards.map((card) => {
            const cardArt = getTarotCardArt(card.card_id);

            return (
              <article key={card.card_id} className="draw-card draw-card-visual">
                <div className="draw-card-media">
                  {cardArt ? (
                    <Image
                      src={cardArt.src}
                      alt={`Tarot card ${card.card_name}`}
                      fill
                      sizes="(max-width: 760px) 100vw, 240px"
                      className="draw-card-image"
                    />
                  ) : (
                    <div className="draw-card-placeholder" aria-hidden="true">
                      <span>{card.card_name}</span>
                    </div>
                  )}
                </div>
                <div className="draw-card-body">
                  <span className="eyebrow draw-card-position">
                    {`位置 ${card.position}`}
                  </span>
                  <strong className="draw-card-name">{card.card_name}</strong>
                  <p className="draw-card-state">
                    {card.orientation === 'reversed' ? '逆位' : '正位'}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {guidance.length ? (
          <div className="guidance-section">
            <strong>可以先记住的提醒</strong>
            <ul className="bullet-list spacious">
              {guidance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="action-row">
          <Link
            href={`/reading/${reading.reading_id}/followup`}
            className="secondary-button link-button"
          >
            继续追问
          </Link>
          <Link href="/history" className="ghost-button link-button">
            查看档案
          </Link>
        </div>
      </section>
    </div>
  );
}
