'use client';

import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/admin/admin-shell';
import { AdminTable } from '@/components/admin/admin-table';
import { apiClient } from '@/lib/api/client';
import { getAdminSession } from '@/lib/auth/session';

type AdminReading = {
  reading_id: string;
  user_id: string;
  session_id: string;
  reading_status: string;
  risk_level: string;
  spread_type: string;
};

export default function AdminReadingsPage() {
  const [items, setItems] = useState<AdminReading[]>([]);

  useEffect(() => {
    void (async () => {
      const token = getAdminSession()?.token;
      if (!token) {
        return;
      }

      const readings = await apiClient.getAdminReadings(token);
      setItems(readings.items);
    })();
  }, []);

  return (
    <AdminShell
      title="读数查询"
      description="快速查看最近生成过的 readings 和它们当前所处的状态。"
    >
      <AdminTable
        columns={['Reading ID', 'User', 'Session', 'Status', 'Risk', 'Spread']}
        rows={items.map((item) => [
          item.reading_id,
          item.user_id,
          item.session_id,
          item.reading_status,
          item.risk_level,
          item.spread_type,
        ])}
        emptyText="当前没有 reading 数据。"
      />
    </AdminShell>
  );
}
