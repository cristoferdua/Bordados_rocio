import { auth } from "@/auth";

export const proxy = auth((req) => {
  if (
    !req.auth &&
    req.nextUrl.pathname !== "/admin/login" &&
    !req.nextUrl.pathname.startsWith("/api/auth/")
  ) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
