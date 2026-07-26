import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "club_session";

const PROTECTED_PREFIXES = ["/admin", "/member"];

function parseSession(raw: string | undefined): { userId: string; role: string } | null {
  if (!raw) return null;
  const parts = raw.split(":");
  if (parts.length < 2) return null;
  const [userId, role] = parts;
  if (!userId || (role !== "admin" && role !== "member")) return null;
  return { userId, role };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const raw = request.cookies.get(COOKIE_NAME)?.value;
  const session = parseSession(raw);

  // Already authenticated — redirect away from /login to correct dashboard
  if (session && pathname === "/login") {
    const dest = session.role === "admin" ? "/admin" : "/member";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  // Unauthenticated user hitting a protected route — send to login
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtected && session) {
    // Role mismatch — redirect to the correct dashboard
    if (pathname.startsWith("/admin") && session.role !== "admin") {
      return NextResponse.redirect(new URL("/member", request.url));
    }
    if (pathname.startsWith("/member") && session.role !== "member") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Attach identity headers for server components / route handlers
    const res = NextResponse.next();
    res.headers.set("x-club-role", session.role);
    res.headers.set("x-club-user", session.userId);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on all routes except Next.js internals and static assets.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
