"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AppShell } from "@/components/common/app-shell";
import { ReadingResult } from "@/components/reading/reading-result";
import { apiClient, type ReadingDetail } from "@/lib/api/client";
import { useRequireSession } from "@/lib/auth/route-guards";
import { getDefaultTheme, getThemeBySlug } from "@/lib/ritual-themes";
import { loadReadingFlow, saveReadingFlow } from "@/lib/state/reading-flow";

export default function ReadingPage() {
  const params = useParams<{ id: string }>();
  const { ready, session } = useRequireSession();
  const [reading, setReading] = useState<ReadingDetail | null>(null);
  const [error, setError] = useState("");
  const [themeSlug] = useState(() => {
    const current = loadReadingFlow();

    return current.entry_theme ?? getDefaultTheme().slug;
  });

  useEffect(() => {
    if (!ready || !session) {
      return;
    }

    void (async () => {
      try {
        const nextReading = await apiClient.getReading(
          session.token,
          params.id,
        );
        setReading(nextReading);
        saveReadingFlow({
          reading_id: nextReading.reading_id,
        });
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "无法加载本次 reading。",
        );
      }
    })();
  }, [params.id, ready, session]);

  if (!ready || !session) {
    return null;
  }

  const theme = getThemeBySlug(themeSlug) ?? getDefaultTheme();

  return (
    <AppShell
      variant="flow"
      stage={6}
      stageLabel="解读回应"
      themeSlug={theme.slug}
      eyebrow="Reading Result"
      title="结果已经整理完成，你可以先读核心回应，再慢慢展开细节。"
      description="这一页会呈现主题、结构化摘要、牌面细节与后续提醒，也保留继续追问的入口。"
    >
      {error ? <p className="error-text">{error}</p> : null}
      {reading ? (
        <ReadingResult reading={reading} themeLabel={theme.label} />
      ) : null}
    </AppShell>
  );
}
