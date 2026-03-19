'use client';

import Link from 'next/link';

import type { ReadingDetail } from '@/lib/api/client';

type ReadingResultProps = {
  reading: ReadingDetail;
};

export function ReadingResult({ reading }: ReadingResultProps) {
  const summary =
    reading.interpretation?.structured_result.summary ?? '系统已整理好本次牌面的核心主题。';
  const guidance = reading.interpretation?.structured_result.guidance ?? [];

  return (
    <div className="result-layout">
      <section className="panel-card" data-testid="result-summary">
        <p className="eyebrow">Reading Ready</p>
        <h2>{reading.interpretation?.structured_result.theme ?? '本次解读结果'}</h2>
        <p className="lede compact">{summary}</p>
        <p className="result-text">{reading.interpretation?.final_text}</p>
      </section>

      <section className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Cards</p>
            <h3>这次抽到的牌</h3>
          </div>
          <span className="status-pill">{reading.reading_status}</span>
        </div>

        <div className="draw-grid">
          {reading.draw?.cards.map((card) => (
            <article key={card.card_id} className="draw-card">
              <span className="eyebrow">Position {card.position}</span>
              <strong>{card.card_name}</strong>
              <p>{card.orientation === 'reversed' ? '逆位' : '正位'}</p>
            </article>
          ))}
        </div>

        {guidance.length ? (
          <ul className="bullet-list spacious">
            {guidance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        <div className="action-row">
          <Link
            href={`/reading/${reading.reading_id}/followup`}
            className="secondary-button link-button"
          >
            继续追问
          </Link>
          <Link href="/history" className="ghost-button link-button">
            查看历史
          </Link>
        </div>
      </section>
    </div>
  );
}
