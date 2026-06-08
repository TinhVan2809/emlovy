import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cấu hình các nhóm Route
const AUTH_ROUTES = ['/login', '/register'];
const PROTECTED_ROUTE_PREFIXES = ['/create', '/notifications', '/reels', '/search', '/profile', '/me'];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = AUTH_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedPage = pathname === '/' || PROTECTED_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix));

  // 1. Nếu cố gắng truy cập trang bảo vệ mà không có token
  if (isProtectedPage && !token) {
    const url = new URL('/login', request.url);
    // Lưu lại trang định truy cập để sau khi login xong có thể quay lại (optional)
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Nếu đã đăng nhập (có token) mà cố tình quay lại trang Login/Register
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

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