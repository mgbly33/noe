'use client';

import type { ProductItem } from '@/lib/api/client';

type ProductListProps = {
  items: ProductItem[];
  recommended: string[];
  selectedSkuId?: string;
  pending: boolean;
  themeLabel: string;
  onSelect: (sku_id: string) => void;
};

const skuDescriptions: Record<string, { label: string; summary: string }> = {
  sku_one_card_single: {
    label: '轻量陪伴',
    summary: '适合先收下一句最重要的提醒，聚焦一个当下问题。',
  },
  sku_three_cards_single: {
    label: '完整展开',
    summary: '从现状、阻力到建议，给你更完整的脉络与方向。',
  },
  sku_three_cards_pack3: {
    label: '持续陪伴',
    summary: '把多次解读留给未来的重要节点，适合阶段性观察。',
  },
};

export function ProductList({
  items,
  recommended,
  selectedSkuId,
  pending,
  themeLabel,
  onSelect,
}: ProductListProps) {
  return (
    <div className="card-grid">
      {items.map((item) => {
        const recommendedItem = recommended.includes(item.sku_id);
        const testId = item.sku_id.replace(/_/g, '-');
        const ritualCopy = skuDescriptions[item.sku_id];

        return (
          <button
            key={item.sku_id}
            type="button"
            className={
              selectedSkuId === item.sku_id
                ? 'oracle-card selected'
                : recommendedItem
                  ? 'oracle-card recommended'
                  : 'oracle-card'
            }
            data-testid={testId}
            onClick={() => onSelect(item.sku_id)}
            disabled={pending}
          >
            <div className="card-topline">
              <span className="eyebrow">
                {recommendedItem ? '更适合此刻' : ritualCopy?.label ?? '解读方式'}
              </span>
              <span className="status-pill">¥ {item.price.toFixed(2)}</span>
            </div>
            <h3>{item.title}</h3>
            <p className="card-meta">
              围绕「{themeLabel}」展开
              {ritualCopy ? ` · ${ritualCopy.summary}` : ''}
            </p>
            <ul className="bullet-list">
              {item.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
