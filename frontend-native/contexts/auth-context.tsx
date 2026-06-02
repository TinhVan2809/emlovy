import { router } from "expo-router";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Routes } from "@/constants/routes";
import { authApi, adminApi } from "@/services/api";
import { tokenStorage } from "@/services/token-storage";
import type { LoginInput, RegisterInput, User } from "@/types/auth";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  user: User | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (nextUser: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const persistSession = useCallback(
    async (nextToken: string, nextUser: User) => {
      await tokenStorage.set(nextToken);
      setToken(nextToken);
      setUser(nextUser);
    },
    [],
  );

  const clearSession = useCallback(async () => {
    await tokenStorage.remove();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const storedToken = await tokenStorage.get();

        if (!storedToken) {
          return;
        }

        const response = await authApi.me(storedToken);

        if (isMounted) {
          setToken(storedToken);
          setUser(response.data.user);
        }
      } catch (_error) {
        await tokenStorage.remove();
        console.error("Error fething bootstrap", _error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await authApi.login(input);
      const newToken = response.data.token;
      await persistSession(newToken, response.data.user);
      // Verify admin access using the freshly received token to avoid using stale state.
      try {
        const responseCheck = await adminApi.check(newToken);

        // Route to admin if either the login payload or the server check identifies admin.
        if (
          response.data.user?.role === 'admin' ||
          responseCheck?.data?.user?.role === 'admin'
        ) {
          router.replace(Routes.admin);
          return; 
        }
      } catch (_err) { 
        // Ignore admin check errors (common for non-admin users).
        if (response.data.user?.role === 'admin') {
          router.replace(Routes.admin);
          return;
        }
          console.log(_err);
      }

      router.replace(Routes.home);
    },
    [persistSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const response = await authApi.register(input);
      await persistSession(response.data.token, response.data.user);
        if (response.data.user?.role === 'admin') {
          router.replace(Routes.admin);
          return;
        }

        router.replace(Routes.home);
    },
    [persistSession],
  );

  const refreshUser = useCallback(async () => {
    if (!token) {
      return;
    }

    const response = await authApi.me(token);
    setUser(response.data.user);
  }, [token]);

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    router.replace(Routes.login);
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      refreshUser,
      signOut,
      token,
      updateUser,
      user,
    }),
    [isLoading, login, refreshUser, register, signOut, token, updateUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
