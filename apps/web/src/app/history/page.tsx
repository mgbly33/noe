'use client';

import { useEffect, useState } from 'react';

import { AppShell } from '@/components/common/app-shell';
import { HistoryList } from '@/components/history/history-list';
import { apiClient } from '@/lib/api/client';
import { getGuestToken } from '@/lib/auth/session';

type HistoryItem = {
  reading_id: string;
  reading_status: string;
  risk_level: string;
  spread_type: string;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    const token = getGuestToken();
    if (!token) {
      return;
    }

    try {
      const history = await apiClient.getHistory(token);
      setItems(history.items);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : '无法加载历史记录。',
      );
    }
  };

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, []);

  const archive = async (reading_id: string) => {
    const token = getGuestToken();
    if (!token) {
      return;
    }

    await apiClient.archiveReading(token, reading_id);
    await load();
  };

  return (
    <AppShell
      eyebrow="History"
      title="保留 READY 与 FOLLOW_UP 状态的阅读记录。"
      description="这里默认不显示已经归档的 reading，用户可以回看、继续追问或手动归档。"
    >
      {error ? <p className="error-text">{error}</p> : null}
      <HistoryList items={items} onArchive={archive} />
    </AppShell>
  );
}
