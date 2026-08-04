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

  // Allow login page access for admins
  if (pathname === "/login") {
    if (session && session.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Member routes check
  if (pathname.startsWith("/member")) {
    if (!session || (session.role !== "member" && session.role !== "admin")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const res = NextResponse.next();
    res.headers.set("x-club-role", session.role);
    res.headers.set("x-club-user", session.userId);
    return res;
  }

  // Admin routes require active admin session
  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
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
