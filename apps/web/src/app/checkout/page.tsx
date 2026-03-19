'use client';

import { startTransition, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/common/app-shell';
import { MockCheckout } from '@/components/checkout/mock-checkout';
import { apiClient } from '@/lib/api/client';
import { getGuestToken } from '@/lib/auth/session';
import { loadReadingFlow } from '@/lib/state/reading-flow';

export default function CheckoutPage() {
  const router = useRouter();
  const [flow, setFlow] = useState(loadReadingFlow());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFlow(loadReadingFlow());
  }, []);

  const selectedProduct = useMemo(() => {
    if (flow.selected_sku_id === 'sku_three_cards_single') {
      return {
        title: 'Three Card Reading',
        price: 39.9,
      };
    }

    if (flow.selected_sku_id === 'sku_three_cards_pack3') {
      return {
        title: 'Three Card Pack x3',
        price: 99,
      };
    }

    return {
      title: 'Single Card Reading',
      price: 19.9,
    };
  }, [flow.selected_sku_id]);

  const pay = async () => {
    const token = getGuestToken();
    if (!token || !flow.order_id) {
      setError('没有可支付的订单，请返回商品页。');

      return;
    }

    setPending(true);
    setError('');

    try {
      await apiClient.startCheckout(token, flow.order_id);
      await apiClient.confirmCheckout(flow.order_id);

      startTransition(() => {
        router.push('/draw');
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '支付失败。');
    } finally {
      setPending(false);
    }
  };

  return (
    <AppShell
      eyebrow="Checkout"
      title="这里不做真支付，但完整走一遍支付状态。"
      description="mock checkout 会创建支付事务并回调后端，支付完成后才会进入 reading 创建与抽牌。"
    >
      {error ? <p className="error-text">{error}</p> : null}
      <MockCheckout
        title={selectedProduct.title}
        price={selectedProduct.price}
        orderId={flow.order_id ?? '未创建'}
        pending={pending}
        onPay={pay}
      />
    </AppShell>
  );
}
