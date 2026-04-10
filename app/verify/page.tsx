import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", url));
  }

  // simulação de user válido
  const user = { id: "123" };

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", url));

  response.cookies.set({
    name: "session",
    value: user.id,
    httpOnly: true,
    path: "/",
  });

  return response;
}