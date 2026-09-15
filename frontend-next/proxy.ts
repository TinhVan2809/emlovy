import { NextResponse } from 'next/server';

export function proxy() {
  return NextResponse.next();
}

// Tối ưu Matcher: Loại bỏ middleware cho các file tĩnh, ảnh và API backend
export const config = {
  matcher: [
    /*
     * Khớp tất cả các đường dẫn trừ:
     * - api (các lời gọi API)
     * - _next/static, _next/image (tài nguyên Next.js)
     * - các file có đuôi mở rộng (png, jpg, svg, ...)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
};
