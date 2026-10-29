import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, setSessionExpiredHandler } from "./api";
import { normalizePhone } from "./format";
import { tokenStorage } from "./storage";
import type { AuthResponse, User } from "./types";

interface RegisterInput {
  name: string;
  phone: string;
  email?: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  /** true while the saved session is being checked at app start */
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await tokenStorage.clear();
    setUser(null);
  }, []);

  // Restore a saved session on app start.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      void logout();
    });

    (async () => {
      try {
        if (await tokenStorage.getAccess()) {
          setUser(await api<User>("/users/me"));
        }
      } catch {
        // invalid/expired session (or server unreachable): start at the login screen
        await tokenStorage.clear();
      } finally {
        setLoading(false);
      }
    })();

    return () => setSessionExpiredHandler(null);
  }, [logout]);

  const startSession = useCallback(async (data: AuthResponse) => {
    await tokenStorage.setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (phone: string, password: string) => {
      const data = await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: { phone: normalizePhone(phone), password },
        auth: false,
      });
      await startSession(data);
    },
    [startSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const data = await api<AuthResponse>("/auth/register", {
        method: "POST",
        body: {
          name: input.name.trim(),
          phone: normalizePhone(input.phone),
          // the API rejects an empty string for email, so omit it when blank
          ...(input.email?.trim() ? { email: input.email.trim() } : {}),
          password: input.password,
        },
        auth: false,
      });
      await startSession(data);
    },
    [startSession],
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
