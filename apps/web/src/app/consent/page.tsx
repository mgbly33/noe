'use client';

import { startTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/common/app-shell';
import { ConsentForm } from '@/components/consent/consent-form';
import { apiClient, ConsentVersions } from '@/lib/api/client';
import { ensureGuestSession, getGuestToken } from '@/lib/auth/session';
import { loadReadingFlow, saveReadingFlow } from '@/lib/state/reading-flow';

export default function ConsentPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [versions, setVersions] = useState<ConsentVersions | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        await ensureGuestSession();
        const latest = await apiClient.getConsentLatest();
        setVersions(latest);
        saveReadingFlow({
          consent_versions: latest,
          consent_accepted: loadReadingFlow().consent_accepted,
        });
      } catch (nextError) {
        setError(
          nextError instanceof Error ? nextError.message : '无法加载声明版本。',
        );
      }
    })();
  }, []);

  const submit = async () => {
    const token = getGuestToken();
    if (!token || !versions) {
      setError('当前会话还没准备好，请稍后重试。');

      return;
    }

    setBusy(true);
    setError('');

    try {
      await apiClient.acceptConsent(token, {
        ...versions,
        accepted: true,
      });
      saveReadingFlow({
        consent_versions: versions,
        consent_accepted: true,
      });
      startTransition(() => {
        router.push('/question');
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : '提交 consent 失败。',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell
      eyebrow="Consent"
      title="先确认边界，再让系统继续。"
      description="这一步只做一件事：拿到最新协议版本，并把 consent 和当前会话绑在一起。"
    >
      <ConsentForm
        checked={checked}
        disabled={busy}
        versions={versions}
        error={error}
        onCheckedChange={setChecked}
        onSubmit={submit}
      />
    </AppShell>
  );
}
