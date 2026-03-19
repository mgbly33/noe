'use client';

import Link from 'next/link';

type HistoryListProps = {
  items: Array<{
    reading_id: string;
    reading_status: string;
    risk_level: string;
    spread_type: string;
  }>;
  onArchive: (reading_id: string) => void;
};

export function HistoryList({ items, onArchive }: HistoryListProps) {
  if (!items.length) {
    return (
      <div className="panel-card">
        <p className="eyebrow">Archive</p>
        <h2>你的解读档案还在等待第一条记录</h2>
        <p className="muted-text">
          完成一次支付解读后，这里会保留 READY 或 FOLLOW_UP 状态的结果，方便你回看或继续追问。
        </p>
      </div>
    );
  }

  return (
    <div className="list-stack archive-grid">
      {items.map((item) => (
        <article key={item.reading_id} className="panel-card compact-card archive-card">
          <div className="panel-head">
            <div>
              <p className="eyebrow">{item.spread_type.replace('_', ' ')}</p>
              <h2>{item.reading_id}</h2>
            </div>
            <span className="status-pill">{item.reading_status}</span>
          </div>
          <p className="muted-text">风险等级：{item.risk_level}</p>
          <div className="action-row">
            <Link href={`/reading/${item.reading_id}`} className="secondary-button link-button">
              打开结果
            </Link>
            <button
              type="button"
              className="ghost-button"
              onClick={() => onArchive(item.reading_id)}
            >
              归档
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
