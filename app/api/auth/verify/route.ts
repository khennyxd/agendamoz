import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", req.url));
  }

  // aqui tu depois validas no Supabase
  const user = { id: "123", email: "test@gmail.com" };

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", req.url));

  response.cookies.set("session", user.id, {
    httpOnly: true,
    path: "/",
  });

  return response;
}