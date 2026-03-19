import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, business_id, business_name } = await request.json();

    if (!email || !business_id) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if already invited
    const { data: existing } = await supabaseAdmin
      .from("team_members")
      .select("id, status")
      .eq("business_id", business_id)
      .eq("email", email.toLowerCase())
      .single();

    if (existing && existing.status !== "removed") {
      return NextResponse.json({ error: "Este email já foi convidado." }, { status: 409 });
    }

    // Check if user already exists in auth
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users?.users?.find(u => u.email === email.toLowerCase());

    if (existing && existing.status === "removed") {
      // Re-activate
      await supabaseAdmin.from("team_members").update({
        status: "pending",
        user_id: existingUser?.id || null,
        invited_at: new Date().toISOString(),
      }).eq("id", existing.id);
    } else {
      // Create new invite
      await supabaseAdmin.from("team_members").insert({
        business_id,
        email: email.toLowerCase(),
        user_id: existingUser?.id || null,
        role: "member",
        status: existingUser ? "active" : "pending",
        joined_at: existingUser ? new Date().toISOString() : null,
      });
    }

    return NextResponse.json({ success: true, userExists: !!existingUser });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
