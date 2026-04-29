import { router } from 'expo-router';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Routes } from '@/constants/routes';
import { authApi } from '@/services/api';
import { tokenStorage } from '@/services/token-storage';
import type { LoginInput, RegisterInput, User } from '@/types/auth';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  user: User | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const persistSession = useCallback(async (nextToken: string, nextUser: User) => {
    await tokenStorage.set(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

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
      await persistSession(response.data.token, response.data.user);
      router.replace(Routes.home);
    },
    [persistSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const response = await authApi.register(input);
      await persistSession(response.data.token, response.data.user);
      router.replace(Routes.home);
    },
    [persistSession],
  );

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
      signOut,
      token,
      user,
    }),
    [isLoading, login, register, signOut, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
