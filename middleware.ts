import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // Usa o cliente oficial do Supabase para ler a sessão dos cookies
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/book") ||
    pathname === "/" ||
    pathname.startsWith("/privacidade") ||
    pathname.startsWith("/termos");

  // Sem sessão e página protegida → redireciona para login
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Já tem sessão e vai para login/register → redireciona para dashboard
  if (session && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return res;
}

export const config = {
  // Aplica o middleware a todas as rotas excepto _next e ficheiros estáticos
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$).*)"],
};
