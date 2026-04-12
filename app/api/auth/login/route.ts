import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { email, type } = await req.json();

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Email inválido" }, { status: 400 });
    }

    if (type === "otp") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify`,
        },
      });
      if (error) throw error;
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Tipo não suportado" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao processar";
    return Response.json({ error: msg }, { status: 500 });
  }
}
