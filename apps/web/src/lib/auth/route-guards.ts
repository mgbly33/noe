"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  getSession,
  refreshSessionProfile,
  signOutAll,
  type AuthSession,
} from "@/lib/auth/session";

type RequireSessionOptions = {
  requireConsent?: boolean;
  requireAdmin?: boolean;
};

const isAdminRole = (role: string) => ["admin", "super_admin"].includes(role);

export const useRequireSession = ({
  requireConsent = true,
  requireAdmin = false,
}: RequireSessionOptions = {}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  const loginRedirect = useMemo(() => {
    const search = typeof window === "undefined" ? "" : window.location.search;
    const target = `${pathname}${search}`;
    return `/auth/login?redirect=${encodeURIComponent(target)}`;
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      const current = getSession();
      if (!current) {
        if (!cancelled) {
          setReady(true);
          router.replace(loginRedirect);
        }

        return;
      }

      try {
        const refreshed = await refreshSessionProfile(current.token);
        const nextSession = refreshed ?? current;

        if (cancelled) {
          return;
        }

        if (requireAdmin && !isAdminRole(nextSession.role)) {
          setReady(true);
          router.replace("/account");

          return;
        }

        if (requireConsent && nextSession.need_consent) {
          setReady(true);
          router.replace("/consent");

          return;
        }

        setSession(nextSession);
        setReady(true);
      } catch {
        if (cancelled) {
          return;
        }

        signOutAll();
        setReady(true);
        router.replace(loginRedirect);
      }
    };

    void resolve();

    return () => {
      cancelled = true;
    };
  }, [loginRedirect, requireAdmin, requireConsent, router]);

  return {
    ready,
    session,
  };
};

export const useRequireAdmin = () =>
  useRequireSession({
    requireConsent: false,
    requireAdmin: true,
  });
