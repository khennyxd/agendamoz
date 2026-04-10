import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", url));
  }

  // simula user válido (depois ligas ao Supabase)
  const userId = "123";

  const response = NextResponse.redirect(new URL("/dashboard", url));

  response.cookies.set("session", userId, {
    httpOnly: false, // IMPORTANTE para testar
    path: "/",
    sameSite: "lax",
  });

  return response;
}