import { auth } from "@/auth";

export default auth((request) => {
  const isAdmin = request.nextUrl.pathname.startsWith("/admin");
  const isLogin = request.nextUrl.pathname.startsWith("/admin/login");
  if (isAdmin && !isLogin && !request.auth) {
    return Response.redirect(new URL("/admin/login", request.nextUrl));
  }
  if (isLogin && request.auth) {
    return Response.redirect(new URL("/admin", request.nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
