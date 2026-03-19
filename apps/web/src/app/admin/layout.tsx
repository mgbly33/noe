"use client";

import { useRequireAdmin } from "@/lib/auth/route-guards";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { ready, session } = useRequireAdmin();

  if (!ready || !session) {
    return null;
  }

  return <>{children}</>;
}
