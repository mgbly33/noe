'use client';

import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/admin/admin-shell';
import { AdminTable } from '@/components/admin/admin-table';
import { apiClient, ProductItem } from '@/lib/api/client';

export default function AdminProductsPage() {
  const [items, setItems] = useState<ProductItem[]>([]);

  useEffect(() => {
    void (async () => {
      const products = await apiClient.getProducts();
      setItems(products.items);
    })();
  }, []);

  return (
    <AdminShell
      title="产品目录"
      description="这里展示当前 active 的 SKU，后续可以继续扩成真正的编辑台。"
    >
      <div className="panel-card" data-testid="admin-products-page">
        <AdminTable
          columns={['SKU', 'Title', 'Type', 'Price']}
          rows={items.map((item) => [
            item.sku_id,
            item.title,
            item.reading_type,
            `¥ ${item.price.toFixed(2)}`,
          ])}
          emptyText="当前没有可展示的商品。"
        />
      </div>
    </AdminShell>
  );
}
