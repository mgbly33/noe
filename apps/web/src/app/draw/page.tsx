'use client';

import { startTransition, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/common/app-shell';
import { DrawStage } from '@/components/draw/draw-stage';
import { apiClient } from '@/lib/api/client';
import { getGuestToken } from '@/lib/auth/session';
import { loadReadingFlow, saveReadingFlow } from '@/lib/state/reading-flow';

export default function DrawPage() {
  const router = useRouter();
  const [step, setStep] = useState('锁定权益');
  const [error, setError] = useState('');

  const runPipeline = useCallback(async () => {
    const token = getGuestToken();
    const flow = loadReadingFlow();

    if (!token || !flow.session_id) {
      setError('缺少 session，请回到首页重新开始。');

      return;
    }

    try {
      if (flow.reading_id) {
        startTransition(() => {
          router.replace(`/reading/${flow.reading_id}`);
        });

        return;
      }

      setStep('锁定权益');
      const reading = await apiClient.createReading(token, flow.session_id);
      saveReadingFlow({
        reading_id: reading.reading_id,
      });

      setStep('抽取牌面');
      await apiClient.drawReading(token, reading.reading_id, true);

      setStep('生成解读');
      await apiClient.generateReading(token, reading.reading_id, {
        style: 'gentle',
        disclaimer_version: 'v1.0',
      });

      setStep('整理结果');
      startTransition(() => {
        router.replace(`/reading/${reading.reading_id}`);
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : '生成 reading 失败。',
      );
    }
  }, [router]);

  useEffect(() => {
    let active = true;

    void (async () => {
      await Promise.resolve();

      if (!active) {
        return;
      }

      await runPipeline();
    })();

    return () => {
      active = false;
    };
  }, [runPipeline]);

  return (
    <AppShell
      eyebrow="Draw"
      title="现在不把随机性交给前端。"
      description="这一步只显示服务端流程的进度：创建 reading、抽牌、生成结构化结果，再跳转到结果页。"
    >
      <DrawStage
        step={step}
        error={error}
        onRetry={() => {
          setError('');
          void runPipeline();
        }}
      />
    </AppShell>
  );
}
