"use client";

import Link from "next/link";
import { startTransition } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/common/app-shell";
import { signOutAll } from "@/lib/auth/session";
import { useRequireSession } from "@/lib/auth/route-guards";
import { loadReadingFlow } from "@/lib/state/reading-flow";

export default function AccountPage() {
  const router = useRouter();
  const { ready, session } = useRequireSession({
    requireConsent: false,
  });
  const flow = loadReadingFlow();

  if (!ready || !session) {
    return null;
  }

  const logout = () => {
    signOutAll();
    startTransition(() => {
      router.push("/");
    });
  };

  const canAccessAdmin = ["admin", "super_admin"].includes(session.role);

  return (
    <AppShell
      variant="flow"
      eyebrow="Account"
      title="你的账户中心"
      description="这里统一承接登录态、历史档案、继续解读和角色权限入口。"
    >
      <div className="panel-card">
        <p className="eyebrow">Profile</p>
        <h2>{session.login_name ?? "未命名用户"}</h2>
        <div className="sanctuary-note-grid">
          <div>
            <strong>角色</strong>
            <span>{session.role}</span>
          </div>
          <div>
            <strong>当前状态</strong>
            <span>
              {session.need_consent ? "待确认说明" : "已可进入业务流程"}
            </span>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <p className="eyebrow">Shortcuts</p>
        <div className="admin-grid">
          {session.need_consent ? (
            <Link href="/consent" className="primary-button link-button">
              先完成说明确认
            </Link>
          ) : (
            <Link href="/history" className="primary-button link-button">
              查看历史档案
            </Link>
          )}
          {flow.reading_id ? (
            <Link
              href={`/reading/${flow.reading_id}`}
              className="ghost-button link-button"
            >
              继续上次解读
            </Link>
          ) : null}
          {canAccessAdmin ? (
            <Link
              href="/admin/products"
              className="ghost-button link-button"
              data-testid="account-admin-entry"
            >
              进入管理台
            </Link>
          ) : null}
          <button
            type="button"
            className="ghost-button"
            data-testid="account-logout"
            onClick={logout}
          >
            退出登录
          </button>
        </div>
      </div>
    </AppShell>
  );
}
