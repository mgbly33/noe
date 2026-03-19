"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { getSession, type AuthSession } from "@/lib/auth/session";
import {
  getDefaultTheme,
  getThemeBySlug,
  type RitualThemeSlug,
} from "@/lib/ritual-themes";

type AppShellProps = {
  children: ReactNode;
  variant?: "home" | "flow";
  eyebrow?: string;
  title?: string;
  description?: string;
  aside?: ReactNode;
  stage?: 1 | 2 | 3 | 4 | 5 | 6;
  stageLabel?: string;
  themeSlug?: RitualThemeSlug;
};

const ritualStages = [
  "边界确认",
  "问题梳理",
  "选择陪伴",
  "仪式确认",
  "牌阵展开",
  "解读回应",
] as const;

export function AppShell({
  children,
  variant = "flow",
  eyebrow,
  title,
  description,
  aside,
  stage,
  stageLabel,
  themeSlug,
}: AppShellProps) {
  const pathname = usePathname();
  const session: AuthSession | null = getSession();
  const theme = themeSlug
    ? (getThemeBySlug(themeSlug) ?? getDefaultTheme())
    : null;
  const inHistory = pathname.startsWith("/history");
  const inAccount = pathname.startsWith("/account");
  const inLogin = pathname.startsWith("/auth/login");
  const inRegister = pathname.startsWith("/auth/register");

  const defaultAside = (
    <div className="sanctuary-note">
      <span className="oracle-kicker">{stageLabel ?? "当前阶段"}</span>
      <h2>{theme?.label ?? "神谕仪式"}</h2>
      <p>
        {theme?.prompt ?? "把问题慢慢理清，再让牌面回应你真正关心的那件事。"}
      </p>
      <div className="sanctuary-note-grid">
        <div>
          <strong>此刻主题</strong>
          <span>{theme?.title ?? "温柔前行"}</span>
        </div>
        <div>
          <strong>陪伴方式</strong>
          <span>{stageLabel ?? "一步一步完成这次解读"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={variant === "home" ? "app-shell app-shell-home" : "app-shell"}
    >
      <header className="floating-nav">
        <div className="brand-lockup">
          <p className="eyebrow">Temple Classic · Gentle Healing</p>
          <strong className="nav-mark">Noe Tarot</strong>
        </div>
        <nav className="nav-links">
          <Link
            href="/"
            className={pathname === "/" ? "nav-link active" : "nav-link"}
          >
            首页
          </Link>
          {session ? (
            <>
              <Link
                href="/history"
                className={inHistory ? "nav-link active" : "nav-link"}
              >
                档案
              </Link>
              <Link
                href="/account"
                data-testid="nav-account"
                className={inAccount ? "nav-link active" : "nav-link ghost"}
              >
                我的账户
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                data-testid="nav-login"
                className={inLogin ? "nav-link active" : "nav-link"}
              >
                登录
              </Link>
              <Link
                href="/auth/register"
                data-testid="nav-register"
                className={
                  inRegister ? "nav-link active ghost" : "nav-link ghost"
                }
              >
                注册
              </Link>
            </>
          )}
        </nav>
      </header>

      {variant === "home" ? (
        <main className="home-shell">{children}</main>
      ) : (
        <main className="flow-shell">
          <section className="flow-main">
            <div className="flow-intro panel-card">
              <div className="flow-intro-copy">
                {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
                {title ? <h1>{title}</h1> : null}
                {description ? <p className="lede">{description}</p> : null}
              </div>
              <div className="flow-intro-meta">
                {theme ? (
                  <span className="theme-badge">{theme.label}</span>
                ) : null}
                {stage ? (
                  <span className="stage-badge">
                    第 {stage} 步{stageLabel ? ` · ${stageLabel}` : ""}
                  </span>
                ) : null}
              </div>
              <div className="stage-track" aria-label="ritual-stage">
                {ritualStages.map((item, index) => {
                  const currentStage = index + 1;
                  const status =
                    stage && currentStage < stage
                      ? "done"
                      : stage === currentStage
                        ? "active"
                        : "upcoming";

                  return (
                    <div
                      key={item}
                      className={`stage-chip stage-chip-${status}`}
                    >
                      <span className="stage-chip-index">{`0${currentStage}`}</span>
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flow-content">{children}</div>
          </section>
          <aside className="flow-aside">{aside ?? defaultAside}</aside>
        </main>
      )}
    </div>
  );
}
