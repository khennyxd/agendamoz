import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", url));

  response.cookies.set({
  name: "session",
  value: "user123",
  httpOnly: true,
  path: "/",
  sameSite: "lax"
});

  return response;
}