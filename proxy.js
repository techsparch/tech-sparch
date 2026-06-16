import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(req) {
  const { pathname } = req.nextUrl;
  let token;
  try {
    token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  } catch (err) {
    console.error("proxy getToken error:", err);
    token = null;
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token.role;

  if (!role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/dashboard") {
    const routes = {
      system: "/dashboard/system",
      ca: "/dashboard/account-manager",
      staff: "/dashboard/staff",
      client: "/dashboard/client",
    };

    return NextResponse.redirect(
      new URL(routes[role] || "/dashboard/client", req.url)
    );
  }

  if (pathname.startsWith("/dashboard/system") && role !== "system") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    pathname.startsWith("/dashboard/account-manager") &&
    role !== "ca" &&
    role !== "system"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    pathname.startsWith("/dashboard/staff") &&
    role !== "staff" &&
    role !== "ca" &&
    role !== "system"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    pathname.startsWith("/dashboard/client") &&
    role !== "client" &&
    role !== "ca" &&
    role !== "system"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
