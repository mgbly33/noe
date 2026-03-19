"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/common/app-shell";
import { HistoryList } from "@/components/history/history-list";
import { apiClient } from "@/lib/api/client";
import { useRequireSession } from "@/lib/auth/route-guards";
import { getDefaultTheme, getThemeBySlug } from "@/lib/ritual-themes";
import { loadReadingFlow } from "@/lib/state/reading-flow";

type HistoryItem = {
  reading_id: string;
  reading_status: string;
  risk_level: string;
  spread_type: string;
};

export default function HistoryPage() {
  const { ready, session } = useRequireSession();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");
  const flow = loadReadingFlow();
  const theme =
    getThemeBySlug(flow.entry_theme ?? getDefaultTheme().slug) ??
    getDefaultTheme();

  const load = async (token: string) => {
    try {
      const history = await apiClient.getHistory(token);
      setItems(history.items);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "无法加载解读档案。",
      );
    }
  };

  useEffect(() => {
    if (!ready || !session) {
      return;
    }

    let active = true;

    void (async () => {
      try {
        const history = await apiClient.getHistory(session.token);

        if (!active) {
          return;
        }

        setItems(history.items);
      } catch (nextError) {
        if (!active) {
          return;
        }

        setError(
          nextError instanceof Error ? nextError.message : "无法加载解读档案。",
        );
      }
    })();

    return () => {
      active = false;
    };
  }, [ready, session]);

  const archive = async (reading_id: string) => {
    if (!session?.token) {
      return;
    }

    await apiClient.archiveReading(session.token, reading_id);
    await load(session.token);
  };

  if (!ready || !session) {
    return null;
  }

  return (
    <AppShell
      variant="flow"
      stage={6}
      stageLabel="解读档案"
      themeSlug={theme.slug}
      eyebrow="History"
      title="把重要的解读保存在这里，方便你回看与继续追问。"
      description="这里默认不显示已归档的 reading，留下来的都是仍值得再次打开的结果。"
    >
      {error ? <p className="error-text">{error}</p> : null}
      <HistoryList items={items} onArchive={archive} />
    </AppShell>
  );
}
