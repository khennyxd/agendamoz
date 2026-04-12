import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware mínimo — não faz auth check aqui
// Auth é tratada em:
//   - app/dashboard/layout.tsx → supabase.auth.getUser()
//   - app/admin/page.tsx       → supabase.auth.getUser()
// Razão: o middleware falhava com env vars undefined no Vercel,
// causando o loop infinito de login.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
