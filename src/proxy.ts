import { auth } from "@/auth";
import { isAdmin, canWrite } from "@/lib/permissions";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const role = (req.auth?.user as any)?.role;

  // Redirect to login if not authenticated
  if (!req.auth && pathname !== "/admin/login" && !pathname.startsWith("/api/auth/")) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  // Role-based route protection
  if (req.auth && role) {
    // /admin/usuarios is admin-only
    if (pathname.startsWith("/admin/usuarios") && !isAdmin(role)) {
      return Response.redirect(new URL("/admin", req.nextUrl.origin));
    }

    // Write operations (POST, PUT, PATCH, DELETE) restricted for viewers
    if (
      req.method !== "GET" &&
      req.method !== "HEAD" &&
      !canWrite(role, "products") &&
      (pathname.startsWith("/admin/productos") || pathname.startsWith("/api/productos") || pathname.startsWith("/api/categorias") || pathname.startsWith("/api/upload"))
    ) {
      return Response.redirect(new URL("/admin", req.nextUrl.origin));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
