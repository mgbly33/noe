"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/common/app-shell";
import { ConsentForm } from "@/components/consent/consent-form";
import { apiClient, type ConsentVersions } from "@/lib/api/client";
import { patchSession } from "@/lib/auth/session";
import { useRequireSession } from "@/lib/auth/route-guards";
import { getDefaultTheme } from "@/lib/ritual-themes";
import { loadReadingFlow, saveReadingFlow } from "@/lib/state/reading-flow";

export default function ConsentPage() {
  const router = useRouter();
  const { ready, session } = useRequireSession({
    requireConsent: false,
  });
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [versions, setVersions] = useState<ConsentVersions | null>(null);
  const [error, setError] = useState("");
  const [themeSlug, setThemeSlug] = useState(getDefaultTheme().slug);

  useEffect(() => {
    const current = loadReadingFlow();
    setThemeSlug(current.entry_theme ?? getDefaultTheme().slug);

    void (async () => {
      try {
        const latest = await apiClient.getConsentLatest();
        setVersions(latest);
        saveReadingFlow({
          consent_versions: latest,
          consent_accepted: loadReadingFlow().consent_accepted,
        });
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "无法加载当前说明版本。",
        );
      }
    })();
  }, []);

  const submit = async () => {
    const token = session?.token;
    if (!token || !versions) {
      setError("当前会话尚未准备好，请稍后重试。");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await apiClient.acceptConsent(token, {
        ...versions,
        accepted: true,
      });
      saveReadingFlow({
        consent_versions: versions,
        consent_accepted: true,
      });
      patchSession({
        need_consent: false,
      });
      startTransition(() => {
        router.push("/question");
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "确认说明失败，请稍后再试。",
      );
    } finally {
      setBusy(false);
    }
  };

  if (!ready || !session) {
    return null;
  }

  return (
    <AppShell
      variant="flow"
      stage={1}
      stageLabel="边界确认"
      themeSlug={themeSlug}
      eyebrow="Consent"
      title="开始之前，先把边界、说明和信任关系确认清楚。"
      description="这一页只做一件事：确认说明版本，并把 consent 绑定到你的真实账户。"
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
