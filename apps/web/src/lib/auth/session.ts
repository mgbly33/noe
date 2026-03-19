import { apiClient } from '@/lib/api/client';
import {
  clearReadingFlow,
  loadReadingFlow,
  saveReadingFlow,
} from '@/lib/state/reading-flow';

const DEVICE_ID_KEY = 'ai-tarot-device-id';
const ADMIN_SESSION_KEY = 'ai-tarot-admin-session';

const isBrowser = () => typeof window !== 'undefined';

const createDeviceId = () => {
  if (!isBrowser()) {
    return 'device_server';
  }

  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const nextId =
    typeof window.crypto?.randomUUID === 'function'
      ? `device_${window.crypto.randomUUID()}`
      : `device_${Date.now()}`;

  window.localStorage.setItem(DEVICE_ID_KEY, nextId);

  return nextId;
};

export const ensureGuestSession = async () => {
  const current = loadReadingFlow();
  if (current.token) {
    return current;
  }

  const session = await apiClient.loginGuest({
    login_type: 'guest',
    device_id: createDeviceId(),
    channel: 'h5',
  });

  return saveReadingFlow({
    token: session.token,
    user_id: session.user_id,
  });
};

export const getGuestToken = () => loadReadingFlow().token;

export const saveAdminSession = (session: {
  token: string;
  user_id: string;
  role: string;
}) => {
  if (!isBrowser()) {
    return session;
  }

  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));

  return session;
};

export const getAdminSession = () => {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as {
      token: string;
      user_id: string;
      role: string;
    };
  } catch {
    return null;
  }
};

export const loginAdmin = async (login_name: string, password: string) => {
  const session = await apiClient.loginAdmin({
    login_type: 'local_admin',
    login_name,
    password,
    channel: 'ops_console',
  });

  return saveAdminSession({
    token: session.token,
    user_id: session.user_id,
    role: session.role,
  });
};

export const clearAdminSession = () => {
  if (isBrowser()) {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  }
};

export const signOutAll = () => {
  clearReadingFlow();
  clearAdminSession();
};
