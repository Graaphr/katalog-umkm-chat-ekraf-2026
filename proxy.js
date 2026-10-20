import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Ambil user dari Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";

  // Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth;
  // kalau belum login, alihkan ke /admin/login.
  if (pathname.startsWith("/admin") && !isLoginPage) {
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      response.cookies.getAll().forEach((c) => {
        redirectResponse.cookies.set(c);
      });
      return redirectResponse;
    }
  }

  return response;
}

export default proxy;

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

