'use client';

import { useState } from 'react';

import { AdminShell } from '@/components/admin/admin-shell';
import { apiClient } from '@/lib/api/client';
import { getAdminSession } from '@/lib/auth/session';

export default function AdminPromptPoliciesPage() {
  const [policyVersion, setPolicyVersion] = useState('prompt_policy_v2');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const publish = async () => {
    const token = getAdminSession()?.token;
    if (!token) {
      setError('请先登录管理端。');

      return;
    }

    setPending(true);
    setSuccess('');
    setError('');

    try {
      const published = await apiClient.publishPromptPolicy(token, policyVersion);
      setSuccess(`已发布 ${published.policy_version}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '发布失败。');
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminShell
      title="Prompt Policy"
      description="发布新的 prompt policy 后，后端会把它切成 active，并用于后续新的 reading 生成。"
    >
      <div className="panel-card">
        <div className="admin-grid">
          <input
            className="admin-input"
            value={policyVersion}
            onChange={(event) => setPolicyVersion(event.target.value)}
            placeholder="prompt_policy_v2"
          />
          <button
            type="button"
            className="primary-button"
            data-testid="publish-policy"
            onClick={publish}
            disabled={pending}
          >
            {pending ? '发布中...' : '发布为 active'}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
          {success ? (
            <p className="status-pill" data-testid="publish-success">
              {success}
            </p>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
