import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'http',
  //       hostname: 'localhost',
  //       port: '8080',
  //       pathname: '/uploads/**', 
         
  //     },
  //   ],
  // },
   images: {
    unoptimized: true, // Bỏ qua toàn bộ image optimization
  },
};

export default nextConfig;
