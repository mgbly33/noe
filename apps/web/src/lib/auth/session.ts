import {
  apiClient,
  type SessionProfile,
  type SessionUser,
} from "@/lib/api/client";
import { clearReadingFlow } from "@/lib/state/reading-flow";

const SESSION_KEY = "ai-tarot-session";

const isBrowser = () => typeof window !== "undefined";

export type AuthSession = SessionUser;

const readSession = () => {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
};

export const saveSession = (session: AuthSession) => {
  if (!isBrowser()) {
    return session;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return session;
};

export const patchSession = (patch: Partial<AuthSession>) => {
  const current = readSession();
  if (!current) {
    return null;
  }

  return saveSession({
    ...current,
    ...patch,
  });
};

export const getSession = () => readSession();

export const getSessionToken = () => readSession()?.token ?? null;

export const getGuestToken = () => getSessionToken();

export const getAdminSession = () => {
  const session = readSession();

  if (!session || !["admin", "super_admin"].includes(session.role)) {
    return null;
  }

  return session;
};

export const registerLocal = async (login_name: string, password: string) => {
  const session = await apiClient.registerLocal({
    login_type: "local",
    login_name,
    password,
    channel: "h5",
  });

  return saveSession(session);
};

export const loginLocal = async (
  login_name: string,
  password: string,
  channel: "h5" | "ops_console" = "h5",
) => {
  const session = await apiClient.loginLocal({
    login_type: "local",
    login_name,
    password,
    channel,
  });

  return saveSession(session);
};

export const loginAdmin = async (login_name: string, password: string) =>
  loginLocal(login_name, password, "ops_console");

export const ensureGuestSession = async () => readSession();

export const refreshSessionProfile = async (token: string) => {
  const profile = await apiClient.getMe(token);
  const current = readSession();

  if (!current) {
    return null;
  }

  return saveSession({
    ...current,
    ...profile,
  });
};

export const applySessionProfile = (profile: SessionProfile) => {
  const current = readSession();

  if (!current) {
    return null;
  }

  return saveSession({
    ...current,
    ...profile,
  });
};

export const clearSession = () => {
  if (isBrowser()) {
    window.localStorage.removeItem(SESSION_KEY);
  }
};

export const signOutAll = () => {
  clearReadingFlow();
  clearSession();
};
