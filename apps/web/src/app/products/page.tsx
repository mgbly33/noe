"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/common/app-shell";
import { ProductList } from "@/components/products/product-list";
import { apiClient, type ProductItem } from "@/lib/api/client";
import { useRequireSession } from "@/lib/auth/route-guards";
import { getDefaultTheme, getThemeBySlug } from "@/lib/ritual-themes";
import { loadReadingFlow, saveReadingFlow } from "@/lib/state/reading-flow";

export default function ProductsPage() {
  const router = useRouter();
  const { ready, session } = useRequireSession();
  const [flow, setFlow] = useState(loadReadingFlow());
  const [items, setItems] = useState<ProductItem[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFlow(loadReadingFlow());

    void (async () => {
      try {
        const products = await apiClient.getProducts();
        setItems(products.items);
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "无法加载当前可选的解读方式。",
        );
      }
    })();
  }, []);

  const selectProduct = async (sku_id: string) => {
    const token = session?.token;
    if (!token || !flow.session_id) {
      setError("缺少当前 session，请返回问题页重新开始。");
      return;
    }

    setPending(true);
    setError("");

    try {
      const order = await apiClient.createOrder(token, {
        session_id: flow.session_id,
        sku_id,
        source: "question_page",
      });

      const nextFlow = saveReadingFlow({
        selected_sku_id: sku_id,
        order_id: order.order_id,
      });
      setFlow(nextFlow);

      startTransition(() => {
        router.push("/checkout");
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "创建订单失败，请稍后再试。",
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
      stage={3}
      stageLabel="选择陪伴"
      themeSlug={theme.slug}
      eyebrow="Reading Depth"
      title="选择这次想获得多深的陪伴与展开。"
      description="这里不再像商品列表，而是选择更适合当前问题与状态的解读深度。"
    >
      {error ? <p className="error-text">{error}</p> : null}
      <ProductList
        items={items}
        recommended={flow.recommended_skus ?? []}
        selectedSkuId={flow.selected_sku_id}
        pending={pending}
        themeLabel={theme.label}
        onSelect={selectProduct}
      />
    </AppShell>
  );
}
