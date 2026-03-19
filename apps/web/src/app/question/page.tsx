'use client';

import { startTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/common/app-shell';
import { QuestionForm } from '@/components/question/question-form';
import { apiClient } from '@/lib/api/client';
import { getGuestToken } from '@/lib/auth/session';
import { loadReadingFlow, saveReadingFlow } from '@/lib/state/reading-flow';

export default function QuestionPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('career');
  const [pending, setPending] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const current = loadReadingFlow();

    setQuestion(current.question_text ?? '');
    setTopic(current.topic_type ?? 'career');
  }, []);

  const submit = async () => {
    const token = getGuestToken();
    if (!token) {
      setError('请先回到首页启动会话。');

      return;
    }

    setPending(true);
    setError('');

    try {
      const risk = await apiClient.checkRisk(token, {
        question_text: question,
        topic_type: topic,
      });

      if (risk.risk_level === 'BLOCK') {
        setBlocked(true);

        return;
      }

      const session = await apiClient.createSession(token, {
        topic_type: topic,
        question_text: question,
        entry_channel: 'h5',
      });

      saveReadingFlow({
        topic_type: topic,
        question_text: question,
        risk_level: session.risk_level,
        session_id: session.session_id,
        recommended_skus: session.recommended_skus,
      });

      startTransition(() => {
        router.push('/products');
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : '问题提交失败。',
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <AppShell
      eyebrow="Question Intake"
      title="用一句具体的问题，换来一条清晰的牌阵路径。"
      description="先做风险检查，再创建 session。安全通过后，后端会返回推荐的商品和后续购买上下文。"
    >
      <QuestionForm
        question={question}
        topic={topic}
        pending={pending}
        blocked={blocked}
        error={error}
        onQuestionChange={setQuestion}
        onTopicChange={setTopic}
        onSubmit={submit}
      />
    </AppShell>
  );
}
