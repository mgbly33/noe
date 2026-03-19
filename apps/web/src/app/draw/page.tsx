"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/common/app-shell";
import { DrawStage } from "@/components/draw/draw-stage";
import { apiClient } from "@/lib/api/client";
import { useRequireSession } from "@/lib/auth/route-guards";
import { getDefaultTheme, getThemeBySlug } from "@/lib/ritual-themes";
import { loadReadingFlow, saveReadingFlow } from "@/lib/state/reading-flow";

const drawSteps = ["确认权益", "展开牌阵", "生成回应", "整理结果"] as const;

export default function DrawPage() {
  const router = useRouter();
  const { ready, session } = useRequireSession();
  const [step, setStep] = useState<(typeof drawSteps)[number]>("确认权益");
  const [error, setError] = useState("");
  const flow = loadReadingFlow();
  const theme =
    getThemeBySlug(flow.entry_theme ?? getDefaultTheme().slug) ??
    getDefaultTheme();

  const runPipeline = useCallback(async () => {
    const token = session?.token;
    const currentFlow = loadReadingFlow();

    if (!token || !currentFlow.session_id) {
      setError("缺少当前 session，请返回首页重新开始。");
      return;
    }

    try {
      if (currentFlow.reading_id) {
        startTransition(() => {
          router.replace(`/reading/${currentFlow.reading_id}`);
        });

        return;
      }

      setStep(drawSteps[0]);
      const reading = await apiClient.createReading(
        token,
        currentFlow.session_id,
      );
      saveReadingFlow({
        reading_id: reading.reading_id,
      });

      setStep(drawSteps[1]);
      await apiClient.drawReading(token, reading.reading_id, true);

      setStep(drawSteps[2]);
      await apiClient.generateReading(token, reading.reading_id, {
        style: "gentle",
        disclaimer_version: "v1.0",
      });

      setStep(drawSteps[3]);
      startTransition(() => {
        router.replace(`/reading/${reading.reading_id}`);
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "生成解读失败，请稍后再试。",
      );
    }
  }, [router, session?.token]);

  useEffect(() => {
    if (!ready || !session) {
      return;
    }

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
  }, [ready, runPipeline, session]);

  if (!ready || !session) {
    return null;
  }

  return (
    <AppShell
      variant="flow"
      stage={5}
      stageLabel="牌阵展开"
      themeSlug={theme.slug}
      eyebrow="Draw"
      title="这一刻不需要你再做什么，只需要等待牌面慢慢展开。"
      description="前端负责把进度稳定呈现出来，真实的 reading 创建、抽牌和结果生成都由服务端完成。"
    >
      <DrawStage
        step={step}
        error={error}
        onRetry={() => {
          setError("");
          void runPipeline();
        }}
      />
    </AppShell>
  );
}
