import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: Request) {
  // ✅ Inicialização DENTRO da função — só corre em runtime, nunca em build time
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY!);

  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Email inválido" }, { status: 400 });
    }

    const token = generateToken();
    const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: dbError } = await supabase
      .from("magic_links")
      .insert({ email, token, expires_at });

    if (dbError) throw dbError;

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

    await resend.emails.send({
      from: "AgendaMoz <onboarding@resend.dev>",
      to: email,
      subject: "O teu link de acesso — AgendaMoz",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #6D28D9;">AgendaMoz</h2>
            <p>Olá! Clica no botão abaixo para entrar na tua conta:</p>
            <a href="${loginUrl}"
               style="display:inline-block; background:#6D28D9; color:white;
                      padding:12px 24px; border-radius:8px; text-decoration:none;
                      font-weight:bold; margin: 16px 0;">
              Entrar na conta
            </a>
            <p style="color:#888; font-size:13px;">
              Este link expira em <strong>15 minutos</strong>.<br/>
              Se não foste tu, ignora este email.
            </p>
          </body>
        </html>
      `,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Login error:", err);
    return Response.json({ error: "Erro ao enviar email" }, { status: 500 });
  }
}
