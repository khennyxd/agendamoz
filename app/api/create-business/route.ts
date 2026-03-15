import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { owner_id, name, slug, type, phone, address } = body;

    if (!owner_id || !name || !slug) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Use service role key — bypasses RLS, runs on server only
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin.from("businesses").insert({
      owner_id,
      name,
      slug,
      type,
      phone: phone || "",
      address: address || "",
      description: "",
    });

    if (error) {
      // Slug already exists
      if (error.code === "23505") {
        return NextResponse.json({ error: "Este link já está em uso. Escolha outro." }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
