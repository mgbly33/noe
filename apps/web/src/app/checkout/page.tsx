"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/common/app-shell";
import { MockCheckout } from "@/components/checkout/mock-checkout";
import { apiClient } from "@/lib/api/client";
import { useRequireSession } from "@/lib/auth/route-guards";
import { getDefaultTheme, getThemeBySlug } from "@/lib/ritual-themes";
import { loadReadingFlow } from "@/lib/state/reading-flow";

export default function CheckoutPage() {
  const router = useRouter();
  const { ready, session } = useRequireSession();
  const [flow, setFlow] = useState(loadReadingFlow());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFlow(loadReadingFlow());
  }, []);

  const selectedProduct = useMemo(() => {
    if (flow.selected_sku_id === "sku_three_cards_single") {
      return {
        title: "三牌完整解读",
        price: 39.9,
      };
    }

    if (flow.selected_sku_id === "sku_three_cards_pack3") {
      return {
        title: "三牌多次陪伴包",
        price: 99,
      };
    }

    return {
      title: "单牌轻量指引",
      price: 19.9,
    };
  }, [flow.selected_sku_id]);

  const pay = async () => {
    const token = session?.token;
    if (!token || !flow.order_id) {
      setError("没有可支付的订单，请返回上一页重新选择。");
      return;
    }

    setPending(true);
    setError("");

    try {
      await apiClient.startCheckout(token, flow.order_id);
      await apiClient.confirmCheckout(flow.order_id);

      startTransition(() => {
        router.push("/draw");
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "支付失败，请稍后再试。",
      );
    } finally {
      setPending(false);
    }
  };

  if (!ready || !session) {
    return null;
  }

  const theme =
    getThemeBySlug(flow.entry_theme ?? getDefaultTheme().slug) ??
    getDefaultTheme();

  return (
    <AppShell
      variant="flow"
      stage={4}
      stageLabel="仪式确认"
      themeSlug={theme.slug}
      eyebrow="Checkout"
      title="开始抽牌之前，再确认一次这次你想要的陪伴方式。"
      description="这里完整走一遍权益确认与状态变更，让后续牌阵与结果生成更稳定。"
    >
      {error ? <p className="error-text">{error}</p> : null}
      <MockCheckout
        title={selectedProduct.title}
        price={selectedProduct.price}
        orderId={flow.order_id ?? "尚未创建"}
        pending={pending}
        themeLabel={theme.label}
        questionText={flow.question_text}
        onPay={pay}
      />
    </AppShell>
  );
}
