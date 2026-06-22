"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 phút: trong khoảng này coi data là "fresh"
            gcTime: 1000 * 60 * 30, // 30 phút: giữ cache trong RAM dù không component nào dùng
            refetchOnWindowFocus: false, // tránh fetch lại mỗi khi đổi tab/cửa sổ
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
