'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { AppShell } from '@/components/common/app-shell';
import { FollowUpForm } from '@/components/followup/followup-form';
import { apiClient } from '@/lib/api/client';
import { getGuestToken } from '@/lib/auth/session';

export default function FollowUpPage() {
  const params = useParams<{ id: string }>();
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const token = getGuestToken();
    if (!token) {
      setError('当前没有可用会话。');

      return;
    }

    setPending(true);
    setError('');

    try {
      const result = await apiClient.createFollowUp(token, params.id, message);
      setReply(result.reply);
      setMessage('');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '追问失败。');
    } finally {
      setPending(false);
    }
  };

  return (
    <AppShell
      eyebrow="Follow-up"
      title="在同一条 reading 上继续追问。"
      description="follow-up 只绑定当前 reading，不会越到其他结果或其他会话里。"
    >
      <FollowUpForm
        message={message}
        reply={reply}
        pending={pending}
        error={error}
        onMessageChange={setMessage}
        onSubmit={submit}
      />
    </AppShell>
  );
}
