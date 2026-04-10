import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return Response.redirect(new URL("/login?error=token_missing", req.url));
  }

  const { data, error } = await supabase
    .from("magic_links")
    .select("*")
    .eq("token", token)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) {
    return Response.redirect(new URL("/login?error=token_invalid", req.url));
  }

  await supabase
    .from("magic_links")
    .update({ used: true })
    .eq("token", token);

  const cookieStore = cookies();
  cookieStore.set("agendamoz_session", data.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });

  return Response.redirect(new URL("/dashboard", req.url));
}
