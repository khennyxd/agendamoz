import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { user_id, email } = await request.json();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find pending invites for this email
    const { data: invites } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("status", "pending");

    if (!invites || invites.length === 0) {
      return NextResponse.json({ joined: false });
    }

    // Activate all pending invites for this email
    for (const invite of invites) {
      await supabaseAdmin.from("team_members").update({
        user_id,
        status: "active",
        joined_at: new Date().toISOString(),
      }).eq("id", invite.id);
    }

    return NextResponse.json({ joined: true, businesses: invites.map(i => i.business_id) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
