'use client';

import { startTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/common/app-shell';
import { ProductList } from '@/components/products/product-list';
import { apiClient, ProductItem } from '@/lib/api/client';
import { getGuestToken } from '@/lib/auth/session';
import { loadReadingFlow, saveReadingFlow } from '@/lib/state/reading-flow';

export default function ProductsPage() {
  const router = useRouter();
  const [flow, setFlow] = useState(loadReadingFlow());
  const [items, setItems] = useState<ProductItem[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFlow(loadReadingFlow());

    void (async () => {
      try {
        const products = await apiClient.getProducts();
        setItems(products.items);
      } catch (nextError) {
        setError(
          nextError instanceof Error ? nextError.message : '无法加载商品列表。',
        );
      }
    })();
  }, []);

  const selectProduct = async (sku_id: string) => {
    const token = getGuestToken();
    if (!token || !flow.session_id) {
      setError('缺少 session，请回到问题页重新开始。');

      return;
    }

    setPending(true);
    setError('');

    try {
      const order = await apiClient.createOrder(token, {
        session_id: flow.session_id,
        sku_id,
        source: 'question_page',
      });

      const nextFlow = saveReadingFlow({
        selected_sku_id: sku_id,
        order_id: order.order_id,
      });
      setFlow(nextFlow);

      startTransition(() => {
        router.push('/checkout');
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '下单失败。');
    } finally {
      setPending(false);
    }
  };

  return (
    <AppShell
      eyebrow="Products"
      title="选一个牌阵，让问题获得匹配的解读深度。"
      description="后端会依据刚才的问题返回推荐 SKU。前端只展示并提交选择，不自己做业务判断。"
    >
      {error ? <p className="error-text">{error}</p> : null}
      <ProductList
        items={items}
        recommended={flow.recommended_skus ?? []}
        selectedSkuId={flow.selected_sku_id}
        pending={pending}
        onSelect={selectProduct}
      />
    </AppShell>
  );
}
