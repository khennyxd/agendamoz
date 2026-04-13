import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY!);

  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Email inválido" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "AgendaMoz <onboarding@resend.dev>",
      to: "khensaniorlando@gmail.com", // temporário para teste
      subject: "Teste de email — AgendaMoz",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7c3aed;">AgendaMoz</h2>
          <p>Este é um email de teste enviado para: <strong>${email}</strong></p>
          <p style="color: #888; font-size: 13px;">Se recebeste este email, o Resend está a funcionar correctamente.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log("Email sent, id:", data?.id);
    return Response.json({ ok: true, id: data?.id });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao processar";
    console.error("Route error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
