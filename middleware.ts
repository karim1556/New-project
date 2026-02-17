import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("club_session")?.value;
  const pathname = request.nextUrl.pathname;

  if (!session) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/member")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const role = session.split(":")[1];
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/member", request.url));
  }
  if (pathname.startsWith("/member") && role !== "member") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*"]
};
