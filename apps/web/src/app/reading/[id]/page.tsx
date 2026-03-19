'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { AppShell } from '@/components/common/app-shell';
import { ReadingResult } from '@/components/reading/reading-result';
import { apiClient, ReadingDetail } from '@/lib/api/client';
import { getGuestToken } from '@/lib/auth/session';
import { saveReadingFlow } from '@/lib/state/reading-flow';

export default function ReadingPage() {
  const params = useParams<{ id: string }>();
  const [reading, setReading] = useState<ReadingDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      const token = getGuestToken();
      if (!token) {
        setError('当前没有可用会话。');

        return;
      }

      try {
        const nextReading = await apiClient.getReading(token, params.id);
        setReading(nextReading);
        saveReadingFlow({
          reading_id: nextReading.reading_id,
        });
      } catch (nextError) {
        setError(
          nextError instanceof Error ? nextError.message : '无法加载 reading。',
        );
      }
    })();
  }, [params.id]);

  return (
    <AppShell
      eyebrow="Reading Result"
      title="结果已经准备好，接下来你可以细看或继续追问。"
      description="展示的是后端已经生成好的结构化主题、正文和牌面细节，前端这里只负责呈现与跳转。"
    >
      {error ? <p className="error-text">{error}</p> : null}
      {reading ? <ReadingResult reading={reading} /> : null}
    </AppShell>
  );
}
