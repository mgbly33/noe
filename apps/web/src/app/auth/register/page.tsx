"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/common/app-shell";
import { getSession, registerLocal } from "@/lib/auth/session";

export default function RegisterPage() {
  const router = useRouter();
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const current = getSession();
    if (!current) {
      return;
    }

    router.replace(current.need_consent ? "/consent" : "/account");
  }, [router]);

  const submit = async () => {
    if (!loginName.trim()) {
      setError("请输入用户名。");
      return;
    }

    if (!password) {
      setError("请输入密码。");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致。");
      return;
    }

    setPending(true);
    setError("");

    try {
      await registerLocal(loginName.trim(), password);
      startTransition(() => {
        router.push("/consent");
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "注册失败，请稍后再试。",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <AppShell
      variant="flow"
      eyebrow="Register"
      title="先建立你的专属账户，再开始这次解读。"
      description="从这一刻起，你的占卜记录、追问、订单和历史档案都会和这个账户绑定。"
    >
      <div className="panel-card">
        <p className="eyebrow">Create Account</p>
        <h2>普通注册</h2>
        <div className="admin-grid">
          <input
            className="admin-input"
            data-testid="register-username"
            value={loginName}
            onChange={(event) => setLoginName(event.target.value)}
            placeholder="用户名"
          />
          <input
            className="admin-input"
            data-testid="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="密码"
          />
          <input
            className="admin-input"
            data-testid="register-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="确认密码"
          />
          {error ? <p className="error-text">{error}</p> : null}
          <button
            type="button"
            className="primary-button"
            data-testid="register-submit"
            onClick={submit}
            disabled={pending}
          >
            {pending ? "注册中..." : "创建账户"}
          </button>
          <Link href="/auth/login" className="ghost-button link-button">
            已有账户，去登录
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
