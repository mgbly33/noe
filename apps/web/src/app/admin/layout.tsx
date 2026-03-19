'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { getAdminSession } from '@/lib/auth/session';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/admin/login') {
      return;
    }

    if (!getAdminSession()) {
      router.replace('/admin/login');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
