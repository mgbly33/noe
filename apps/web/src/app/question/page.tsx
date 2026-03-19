"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/common/app-shell";
import { QuestionForm } from "@/components/question/question-form";
import { apiClient } from "@/lib/api/client";
import { useRequireSession } from "@/lib/auth/route-guards";
import {
  getDefaultTheme,
  mapThemeToTopicType,
  type RitualThemeSlug,
} from "@/lib/ritual-themes";
import { loadReadingFlow, saveReadingFlow } from "@/lib/state/reading-flow";

export default function QuestionPage() {
  const router = useRouter();
  const { ready, session } = useRequireSession();
  const [question, setQuestion] = useState("");
  const [themeSlug, setThemeSlug] = useState<RitualThemeSlug>(
    getDefaultTheme().slug,
  );
  const [pending, setPending] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const current = loadReadingFlow();

    setQuestion(current.question_text ?? "");
    setThemeSlug(current.entry_theme ?? getDefaultTheme().slug);
  }, []);

  const updateTheme = (nextTheme: RitualThemeSlug) => {
    setThemeSlug(nextTheme);
    setBlocked(false);
    setError("");
    saveReadingFlow({
      entry_theme: nextTheme,
      topic_type: mapThemeToTopicType(nextTheme),
    });
  };

  const updateQuestion = (value: string) => {
    setQuestion(value);
    if (blocked) {
      setBlocked(false);
    }
  };

  const submit = async () => {
    const token = session?.token;
    const topicType = mapThemeToTopicType(themeSlug);
    if (!token) {
      setError("请先登录，再继续本次解读。");
      return;
    }

    setPending(true);
    setError("");

    try {
      const risk = await apiClient.checkRisk(token, {
        question_text: question,
        topic_type: topicType,
      });

      if (risk.risk_level === "BLOCK") {
        saveReadingFlow({
          entry_theme: themeSlug,
          topic_type: topicType,
          question_text: question,
          risk_level: risk.risk_level,
          session_id: undefined,
          recommended_skus: undefined,
        });
        setBlocked(true);
        return;
      }

      const nextSession = await apiClient.createSession(token, {
        topic_type: topicType,
        question_text: question,
        entry_channel: "h5",
      });

      saveReadingFlow({
        entry_theme: themeSlug,
        topic_type: topicType,
        question_text: question,
        risk_level: nextSession.risk_level,
        session_id: nextSession.session_id,
        recommended_skus: nextSession.recommended_skus,
      });

      startTransition(() => {
        router.push("/products");
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "问题提交失败，请稍后再试。",
      );
    } finally {
      setPending(false);
    }
  };

  if (!ready || !session) {
    return null;
  }

  return (
    <AppShell
      variant="flow"
      stage={2}
      stageLabel="问题梳理"
      themeSlug={themeSlug}
      eyebrow="Question Intake"
      title="把真正重要的问题说清楚，再让牌面回应。"
      description="系统会先做边界检查，再为你创建本次 reading session。问题越具体，回应越贴近你的处境。"
    >
      <QuestionForm
        question={question}
        themeSlug={themeSlug}
        pending={pending}
        blocked={blocked}
        error={error}
        onQuestionChange={updateQuestion}
        onThemeChange={updateTheme}
        onSubmit={submit}
      />
    </AppShell>
  );
}
