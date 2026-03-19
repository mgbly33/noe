"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { AppShell } from "@/components/common/app-shell";
import { FollowUpForm } from "@/components/followup/followup-form";
import { apiClient } from "@/lib/api/client";
import { useRequireSession } from "@/lib/auth/route-guards";
import { getDefaultTheme, getThemeBySlug } from "@/lib/ritual-themes";
import { loadReadingFlow } from "@/lib/state/reading-flow";

export default function FollowUpPage() {
  const params = useParams<{ id: string }>();
  const { ready, session } = useRequireSession();
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const flow = loadReadingFlow();
  const theme =
    getThemeBySlug(flow.entry_theme ?? getDefaultTheme().slug) ??
    getDefaultTheme();

  const submit = async () => {
    const token = session?.token;
    if (!token) {
      setError("当前没有可用会话，请重新进入本次 reading。");
      return;
    }

    setPending(true);
    setError("");

    try {
      const result = await apiClient.createFollowUp(token, params.id, message);
      setReply(result.reply);
      setMessage("");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "追问失败，请稍后再试。",
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
      stage={6}
      stageLabel="继续追问"
      themeSlug={theme.slug}
      eyebrow="Follow-up"
      title="如果还有没被说清的地方，可以继续把问题留给这一轮牌面。"
      description="追问会绑定当前 reading，让这次回应继续沿着同一条线索展开。"
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
