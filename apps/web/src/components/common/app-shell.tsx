'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

type AppShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
};

export function AppShell({
  eyebrow,
  title,
  description,
  children,
  aside,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <header className="floating-nav">
        <div>
          <p className="eyebrow">AI Tarot MVP</p>
          <strong className="nav-mark">Arcana Flow</strong>
        </div>
        <nav className="nav-links">
          <Link
            href="/"
            className={pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            首页
          </Link>
          <Link
            href="/history"
            className={pathname === '/history' ? 'nav-link active' : 'nav-link'}
          >
            历史
          </Link>
          <Link href="/admin/login" className="nav-link ghost">
            Admin
          </Link>
        </nav>
      </header>

      <main className="hero-grid">
        <section className="hero-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lede">{description}</p>
          <div className="content-stack">{children}</div>
        </section>
        <aside className="ritual-panel">
          {aside ?? (
            <div className="oracle-note">
              <span className="oracle-kicker">Current Mode</span>
              <h2>把问题整理清楚，再让牌面回答。</h2>
              <p>
                这个 H5 流程会把 consent、风险检查、下单、抽牌、生成结果和追问都串在一条稳定路径里。
              </p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
