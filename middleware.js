import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const roleRoutes = {
    system: "/dashboard/system",
    ca: "/dashboard/account-manager",
    staff: "/dashboard/staff",
    client: "/dashboard/client",
  };

  // Root dashboard redirect → send directly to role's home
  if (pathname === "/dashboard") {
    return NextResponse.redirect(
      new URL(roleRoutes[token.role] || "/login", req.url)
    );
  }

  // Role protection map
  const accessRules = {
    "/dashboard/system": ["system"],
    "/dashboard/account-manager": ["system", "ca"],
    "/dashboard/staff": ["system", "ca", "staff"],
    "/dashboard/client": ["system", "ca", "client"],
  };

  for (const path in accessRules) {
    if (pathname.startsWith(path)) {
      if (!accessRules[path].includes(token.role)) {
        // ✅ Redirect to their OWN dashboard, not /dashboard
        // This prevents the loop: /dashboard → role path → access fail → /dashboard...
        const safePath = roleRoutes[token.role] || "/login";
        return NextResponse.redirect(new URL(safePath, req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};