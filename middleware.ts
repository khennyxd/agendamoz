import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // Lê e actualiza os cookies de sessão do Supabase
  const supabase = createMiddlewareClient({ req: request, res });

  // IMPORTANTE: chamar getSession() actualiza o token se expirou
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Páginas que não precisam de sessão
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/book/") ||
    pathname.startsWith("/privacidade") ||
    pathname.startsWith("/termos") ||
    pathname === "/";

  // Sem sessão → redireciona para login
  if (!session && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Já tem sessão e vai para login/register → redireciona para dashboard
  if (session && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Devolve sempre res (não NextResponse.next()) para preservar cookies actualizados
  return res;
}

export const config = {
  matcher: [
    // Aplica a tudo excepto ficheiros estáticos
    "/((?!_next/static|_next/image|favicon.ico|amlogo.svg|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.ico$).*)",
  ],
};
