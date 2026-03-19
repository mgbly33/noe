'use client';

import { startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';

import { loginAdmin } from '@/lib/auth/session';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loginName, setLoginName] = useState('admin');
  const [password, setPassword] = useState('admin123456');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setPending(true);
    setError('');

    try {
      await loginAdmin(loginName, password);
      startTransition(() => {
        router.push('/admin/products');
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '登录失败。');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <p className="eyebrow">Admin Login</p>
        <h1>Arcana Control</h1>
        <p className="muted-text">
          本地 phase-1 管理入口，只验证数据库里 seeded 的 admin 账号。
        </p>
      </aside>
      <section className="admin-content">
        <div className="panel-card">
          <p className="eyebrow">Credentials</p>
          <h2>登录管理端</h2>
          <div className="admin-grid">
            <input
              className="admin-input"
              data-testid="admin-username"
              value={loginName}
              onChange={(event) => setLoginName(event.target.value)}
              placeholder="admin"
            />
            <input
              className="admin-input"
              data-testid="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="admin123456"
            />
            {error ? <p className="error-text">{error}</p> : null}
            <button
              type="button"
              className="primary-button"
              data-testid="admin-login-submit"
              onClick={submit}
              disabled={pending}
            >
              {pending ? '登录中...' : '进入控制台'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
