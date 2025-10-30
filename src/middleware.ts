import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.clone();

  console.log("🔐 Middleware:", {
    path: url.pathname,
    hasToken: !!token,
  });

  // ✅ Protect only /admin/dashboard and deeper routes
  if (url.pathname.startsWith("/admin/dashboard")) {
    if (!token) {
      console.log("❌ No token - redirecting to login");
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    try {
      // ✅ Edge-compatible JWT verification using jose
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      
      console.log("✅ Token valid - allowing access");
      return NextResponse.next();
    } catch (error) {
      console.log("❌ Token invalid:", error);
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // ✅ If already logged in, redirect from login page
  if (url.pathname === "/admin/login" && token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      
      console.log("✅ Already logged in - redirecting to dashboard");
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    } catch {
      console.log("❌ Invalid token on login page");
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};