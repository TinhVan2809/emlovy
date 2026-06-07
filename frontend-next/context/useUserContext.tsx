// context/useUserContext.tsx
"use client";

import { useRouter } from "next/navigation";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import port from "@/api/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchMe: () => Promise<void>;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Gọi API /auth/me để lấy thông tin user từ cookie httpOnly do server set
  const fetchMe = useCallback(async () => {
    try {
      const response = await fetch(`${port}/api/auth/me`, {
        method: "GET",
        credentials: "include", // ← Quan trọng: gửi kèm cookie httpOnly
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout: gọi API để server xóa cookie, sau đó clear state
  const logout = useCallback(async () => {
    try {
      const response = await fetch(`${port}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();

      if(data.success) {
        console.log("dang xuat thanh cong");
        router.push("/login");
      }
    } catch {
      // Dù API lỗi vẫn clear state
    } finally {
      setUser(null);
    }
  }, [router]);

  // Khi app khởi động → kiểm tra session từ server
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        fetchMe,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside <UserProvider>");
  }
  return context;
}
