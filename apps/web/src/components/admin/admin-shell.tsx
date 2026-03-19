'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

type AdminShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const navItems = [
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/readings', label: 'Readings' },
  { href: '/admin/risk-events', label: 'Risk Events' },
  { href: '/admin/prompt-policies', label: 'Prompt Policies' },
];

export function AdminShell({
  title,
  description,
  children,
}: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <p className="eyebrow">Ops Console</p>
        <h1>Arcana Control</h1>
        <p className="muted-text">{description}</p>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href ? 'admin-link active' : 'admin-link'
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="admin-content">
        <div className="admin-header">
          <p className="eyebrow">Admin Dashboard</p>
          <h2>{title}</h2>
        </div>
        {children}
      </section>
    </div>
  );
}
