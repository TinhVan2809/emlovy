import { NextRequest, NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/utils/authToken";

const publicPaths = new Set(["/login", "/register"]);

const isProtectedPath = (pathname: string) => {
  if (publicPaths.has(pathname)) {
    return false;
  }

  return (
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/create") ||
    pathname.startsWith("/follows") ||
    pathname.startsWith("/me") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/reels") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/setting") ||
    pathname.startsWith("/stories")
  );
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname) || request.cookies.has(AUTH_SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);

  return NextResponse.redirect(loginUrl);
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
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
