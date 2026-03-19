'use client';

import type { ProductItem } from '@/lib/api/client';

type ProductListProps = {
  items: ProductItem[];
  recommended: string[];
  selectedSkuId?: string;
  pending: boolean;
  onSelect: (sku_id: string) => void;
};

export function ProductList({
  items,
  recommended,
  selectedSkuId,
  pending,
  onSelect,
}: ProductListProps) {
  return (
    <div className="card-grid">
      {items.map((item) => {
        const recommendedItem = recommended.includes(item.sku_id);
        const testId = item.sku_id.replace(/_/g, '-');

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
                {recommendedItem ? 'Recommended' : 'Reading SKU'}
              </span>
              <span className="status-pill">¥ {item.price.toFixed(2)}</span>
            </div>
            <h3>{item.title}</h3>
            <p className="card-meta">{item.reading_type.replace('_', ' ')}</p>
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
