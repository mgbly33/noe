import type { ConsentVersions } from '@/lib/api/client';

export type ReadingFlowState = {
  token?: string;
  user_id?: string;
  consent_versions?: ConsentVersions;
  consent_accepted?: boolean;
  topic_type?: string;
  question_text?: string;
  risk_level?: string;
  recommended_skus?: string[];
  session_id?: string;
  selected_sku_id?: string;
  order_id?: string;
  reading_id?: string;
};

const STORAGE_KEY = 'ai-tarot-reading-flow';

const isBrowser = () => typeof window !== 'undefined';

export const loadReadingFlow = (): ReadingFlowState => {
  if (!isBrowser()) {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as ReadingFlowState;
  } catch {
    return {};
  }
};

export const saveReadingFlow = (patch: Partial<ReadingFlowState>) => {
  const nextState = {
    ...loadReadingFlow(),
    ...patch,
  };

  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }

  return nextState;
};

export const clearReadingFlow = () => {
  if (isBrowser()) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

export const resetReadingJourney = () => {
  const current = loadReadingFlow();
  const preserved: ReadingFlowState = {
    token: current.token,
    user_id: current.user_id,
    consent_versions: current.consent_versions,
    consent_accepted: current.consent_accepted,
  };

  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preserved));
  }

  return preserved;
};
