"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/common/app-shell";
import { getSession, loginLocal } from "@/lib/auth/session";

const normalizeRedirect = (target: string | null) => {
  if (!target || !target.startsWith("/")) {
    return "/account";
  }

  return target;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const current = getSession();
    if (!current) {
      return;
    }

    const target = normalizeRedirect(searchParams.get("redirect"));
    router.replace(current.need_consent ? "/consent" : target);
  }, [router, searchParams]);

  const submit = async () => {
    if (!loginName.trim() || !password) {
      setError("请输入用户名和密码。");
      return;
    }

    setPending(true);
    setError("");

    try {
      const target = normalizeRedirect(searchParams.get("redirect"));
      const channel = target.startsWith("/admin") ? "ops_console" : "h5";
      const session = await loginLocal(loginName.trim(), password, channel);

      startTransition(() => {
        router.push(session.need_consent ? "/consent" : target);
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "登录失败，请稍后再试。",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <AppShell
      variant="flow"
      eyebrow="Login"
      title="登录你的账户，再继续这次解读。"
      description="同一个入口同时服务普通用户和管理员，权限由账户角色决定，不再公开暴露后台入口。"
    >
      <div className="panel-card">
        <p className="eyebrow">Sign In</p>
        <h2>账户登录</h2>
        <div className="admin-grid">
          <input
            className="admin-input"
            data-testid="login-username"
            value={loginName}
            onChange={(event) => setLoginName(event.target.value)}
            placeholder="用户名"
          />
          <input
            className="admin-input"
            data-testid="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="密码"
          />
          {error ? <p className="error-text">{error}</p> : null}
          <button
            type="button"
            className="primary-button"
            data-testid="login-submit"
            onClick={submit}
            disabled={pending}
          >
            {pending ? "登录中..." : "进入账户"}
          </button>
          <Link href="/auth/register" className="ghost-button link-button">
            还没有账户，去注册
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
