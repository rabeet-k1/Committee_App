import { API_URL } from "./config";
import { tokenStorage } from "./storage";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function errorMessage(e: unknown) {
  return e instanceof ApiError
    ? e.message
    : "Something went wrong. Please try again.";
}

// Called when the refresh token is rejected, so the app can drop back to the login screen.
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(fn: (() => void) | null) {
  onSessionExpired = fn;
}

interface Options {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** false for login/register, which have no token yet */
  auth?: boolean;
}

// One refresh at a time, even if several requests get a 401 together.
let refreshing: Promise<boolean> | null = null;

function refreshTokens(): Promise<boolean> {
  refreshing ??= (async () => {
    const refreshToken = await tokenStorage.getRefresh();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: baseHeaders(),
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      await tokenStorage.setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

function baseHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    // lets requests through a public dev tunnel without its browser warning page
    "X-Tunnel-Skip-AntiPhishing-Page": "true",
  };
}

export async function api<T>(
  path: string,
  { method = "GET", body, auth = true }: Options = {},
): Promise<T> {
  const send = async () => {
    const headers = baseHeaders();
    if (auth) {
      const token = await tokenStorage.getAccess();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };

  let res: Response;
  try {
    res = await send();
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the server. Check your internet connection.",
    );
  }

  // Access token lasts 15 min: on a 401, refresh once and retry the same request.
  if (res.status === 401 && auth) {
    if (await refreshTokens()) {
      try {
        res = await send();
      } catch {
        throw new ApiError(
          0,
          "Cannot reach the server. Check your internet connection.",
        );
      }
    }
    if (res.status === 401) {
      onSessionExpired?.();
      throw new ApiError(401, "Your session expired. Please sign in again.");
    }
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(res.status, "Unexpected response from the server.");
    }
  }

  if (!res.ok) {
    const message = (data as { message?: string | string[] } | null)?.message;
    throw new ApiError(
      res.status,
      Array.isArray(message)
        ? message.join("\n")
        : (message ?? `Request failed (${res.status})`),
    );
  }

  return data as T;
}
