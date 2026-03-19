'use client';

import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/admin/admin-shell';
import { AdminTable } from '@/components/admin/admin-table';
import { apiClient } from '@/lib/api/client';
import { getAdminSession } from '@/lib/auth/session';

type RiskEvent = {
  event_id: string;
  user_id: string | null;
  scene: string;
  risk_level: string;
  action_taken: string;
};

export default function AdminRiskEventsPage() {
  const [items, setItems] = useState<RiskEvent[]>([]);

  useEffect(() => {
    void (async () => {
      const token = getAdminSession()?.token;
      if (!token) {
        return;
      }

      const events = await apiClient.getAdminRiskEvents(token);
      setItems(events.items);
    })();
  }, []);

  return (
    <AdminShell
      title="风险事件"
      description="问题输入与追问触发的风险记录都可以在这里回看。"
    >
      <AdminTable
        columns={['Event ID', 'User', 'Scene', 'Risk', 'Action']}
        rows={items.map((item) => [
          item.event_id,
          item.user_id ?? 'anonymous',
          item.scene,
          item.risk_level,
          item.action_taken,
        ])}
        emptyText="当前没有风险事件。"
      />
    </AdminShell>
  );
}
