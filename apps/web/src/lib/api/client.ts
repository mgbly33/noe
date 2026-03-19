export type ConsentVersions = {
  privacy_version: string;
  disclaimer_version: string;
  ai_notice_version: string;
  age_notice_version: string;
};

export type SessionUser = {
  user_id: string;
  token: string;
  need_consent: boolean;
  role: string;
  login_name: string | null;
  login_type: string | null;
};

export type SessionProfile = Omit<SessionUser, "token">;

export type ProductItem = {
  sku_id: string;
  sku_type: string;
  reading_type: string;
  price: number;
  title: string;
  benefits: string[];
  status: string;
};

export type ReadingSummary = {
  reading_id: string;
  session_id: string;
  reading_status: string;
  risk_level: string;
};

export type ReadingDetail = ReadingSummary & {
  spread_type: string;
  draw: {
    cards: Array<{
      card_id: string;
      card_name: string;
      position: number;
      orientation: string;
    }>;
    reversed_enabled: boolean;
  } | null;
  interpretation: {
    structured_result: {
      theme?: string;
      summary?: string;
      guidance?: string[];
    };
    final_text: string | null;
    policy_version: string | null;
  } | null;
};

type ApiSuccess<T> = {
  code: number;
  data: T;
};

type RequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  token?: string;
};

const buildPath = (path: string) =>
  path.startsWith("/api/")
    ? path
    : `/api${path.startsWith("/") ? path : `/${path}`}`;

async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(buildPath(path), {
    method: options.method ?? "GET",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiSuccess<T>
    | {
        message?: string;
        error?: string;
      }
    | null;

  if (!response.ok) {
    throw new Error(
      payload && "message" in payload && payload.message
        ? payload.message
        : payload && "error" in payload && payload.error
          ? payload.error
          : "请求失败，请稍后再试。",
    );
  }

  if (!payload || !("data" in payload)) {
    throw new Error("响应格式不正确。");
  }

  return payload.data;
}

export const apiClient = {
  registerLocal: (body: {
    login_type: "local";
    login_name: string;
    password: string;
    channel: "h5";
  }) =>
    apiRequest<SessionUser>("/auth/register", {
      method: "POST",
      body,
    }),
  loginLocal: (body: {
    login_type: "local";
    login_name: string;
    password: string;
    channel: "h5" | "ops_console";
  }) =>
    apiRequest<SessionUser>("/auth/login", {
      method: "POST",
      body,
    }),
  loginGuest: (body: {
    login_type: "guest";
    device_id: string;
    channel: "h5";
  }) =>
    apiRequest<SessionUser>("/auth/login", {
      method: "POST",
      body,
    }),
  loginAdmin: (body: {
    login_type: "local_admin";
    login_name: string;
    password: string;
    channel: "ops_console";
  }) =>
    apiRequest<SessionUser>("/auth/login", {
      method: "POST",
      body,
    }),
  getMe: (token: string) =>
    apiRequest<SessionProfile>("/auth/me", {
      token,
    }),
  getConsentLatest: () => apiRequest<ConsentVersions>("/consent/latest"),
  acceptConsent: (token: string, body: ConsentVersions & { accepted: true }) =>
    apiRequest<{ accepted: boolean; accepted_at: string }>("/consent/accept", {
      method: "POST",
      token,
      body,
    }),
  checkRisk: (
    token: string,
    body: { question_text: string; topic_type: string },
  ) =>
    apiRequest<{ risk_level: string; risk_tags: string[] }>(
      "/question/check-risk",
      {
        method: "POST",
        token,
        body,
      },
    ),
  createSession: (
    token: string,
    body: { topic_type: string; question_text: string; entry_channel: "h5" },
  ) =>
    apiRequest<{
      session_id: string;
      risk_level: string;
      recommended_skus: string[];
    }>("/session/create", {
      method: "POST",
      token,
      body,
    }),
  getProducts: () => apiRequest<{ items: ProductItem[] }>("/products"),
  createOrder: (
    token: string,
    body: { session_id: string; sku_id: string; source: string },
  ) =>
    apiRequest<{
      order_id: string;
      amount: number;
      payable_amount: number;
      pay_status: string;
      expire_at: string;
    }>("/orders/create", {
      method: "POST",
      token,
      body,
    }),
  startCheckout: (token: string, order_id: string) =>
    apiRequest<{
      order_id: string;
      pay_status: string;
      checkout_token: string;
    }>("/payments/mock/checkout", {
      method: "POST",
      token,
      body: { order_id },
    }),
  confirmCheckout: (order_id: string) =>
    apiRequest<{ order_id: string; pay_status: string }>(
      "/payments/mock/callback",
      {
        method: "POST",
        body: { order_id },
      },
    ),
  createReading: (token: string, session_id: string) =>
    apiRequest<ReadingSummary>("/readings/create", {
      method: "POST",
      token,
      body: { session_id },
    }),
  drawReading: (token: string, reading_id: string, reversed_enabled: boolean) =>
    apiRequest<
      ReadingSummary & {
        cards: Array<{
          card_id: string;
          card_name: string;
          position: number;
          orientation: string;
        }>;
      }
    >(`/readings/${reading_id}/draw`, {
      method: "POST",
      token,
      body: { reversed_enabled },
    }),
  generateReading: (
    token: string,
    reading_id: string,
    body: { style: string; disclaimer_version: string },
  ) =>
    apiRequest<
      ReadingSummary & {
        structured_result: {
          theme?: string;
          summary?: string;
          guidance?: string[];
        };
        final_text: string;
      }
    >(`/readings/${reading_id}/generate`, {
      method: "POST",
      token,
      body,
    }),
  getReading: (token: string, reading_id: string) =>
    apiRequest<ReadingDetail>(`/readings/${reading_id}`, {
      token,
    }),
  createFollowUp: (token: string, reading_id: string, message: string) =>
    apiRequest<{ reading_id: string; reply: string; risk_level: string }>(
      `/readings/${reading_id}/follow-up`,
      {
        method: "POST",
        token,
        body: { message },
      },
    ),
  getHistory: (token: string) =>
    apiRequest<{
      items: Array<
        ReadingSummary & {
          spread_type: string;
        }
      >;
    }>("/readings/history", {
      token,
    }),
  archiveReading: (token: string, reading_id: string) =>
    apiRequest<{ reading_id: string; archived: boolean }>(
      `/readings/${reading_id}`,
      {
        method: "DELETE",
        token,
      },
    ),
  getAssetBalance: (token: string) =>
    apiRequest<{
      total_available_count: number;
      total_locked_count: number;
      items: Array<{
        asset_id: string;
        available_count: number;
        locked_count: number;
        source_order_id: string;
      }>;
    }>("/assets/balance", {
      token,
    }),
  getAdminReadings: (token: string) =>
    apiRequest<{
      items: Array<{
        reading_id: string;
        user_id: string;
        session_id: string;
        reading_status: string;
        risk_level: string;
        spread_type: string;
        created_at: string;
      }>;
    }>("/admin/readings", {
      token,
    }),
  getAdminRiskEvents: (token: string) =>
    apiRequest<{
      items: Array<{
        event_id: string;
        user_id: string | null;
        scene: string;
        risk_level: string;
        action_taken: string;
        created_at: string;
      }>;
    }>("/admin/risk-events", {
      token,
    }),
  publishPromptPolicy: (token: string, policy_version: string) =>
    apiRequest<{ policy_version: string; status: string }>(
      "/admin/prompt-policies/publish",
      {
        method: "POST",
        token,
        body: { policy_version },
      },
    ),
};
