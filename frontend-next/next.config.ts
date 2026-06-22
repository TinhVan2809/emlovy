import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    unoptimized: true, // Bỏ qua toàn bộ image optimization
  },
};

export default nextConfig;
