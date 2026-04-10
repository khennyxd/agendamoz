// SMS helper — always call via the API route (works server + client side)

export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    // Use absolute URL so it works both server-side and client-side
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "https://agendamoz.vercel.app";

    const res = await fetch(`${baseUrl}/api/send-sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, message }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("sendSMS failed:", data);
      return false;
    }
    return true;
  } catch (err) {
    console.error("sendSMS error:", err);
    return false;
  }
}

// ── SMS Templates ───────────────────────────────────────────────────────────

export function smsConfirmacao(
  clientName: string,
  businessName: string,
  date: string,
  time: string,
  serviceName: string
): string {
  return `✅ Olá ${clientName}! A sua reserva em ${businessName} foi confirmada.\n📅 ${date} às ${time}\n💼 ${serviceName}\nObrigado!`;
}

export function smsPendente(
  clientName: string,
  businessName: string,
  date: string,
  time: string
): string {
  return `📋 Olá ${clientName}! Recebemos a sua reserva em ${businessName} para ${date} às ${time}. Iremos confirmar em breve.`;
}

export function smsCancelamento(
  clientName: string,
  businessName: string,
  date: string,
  time: string
): string {
  return `❌ Olá ${clientName}, informamos que a sua reserva em ${businessName} para ${date} às ${time} foi cancelada. Pedimos desculpa pelo inconveniente.`;
}

export function smsLembrete(
  clientName: string,
  businessName: string,
  date: string,
  time: string,
  serviceName: string
): string {
  return `⏰ Lembrete: ${clientName}, tem uma reserva amanhã em ${businessName}.\n📅 ${date} às ${time}\n💼 ${serviceName}\nAté amanhã!`;
}

export function smsActivacaoPlano(
  businessName: string,
  planName: string,
  reference: string
): string {
  return `✅ AgendaMoz: O plano ${planName} de ${businessName} foi activado! Ref: ${reference}. Válido por 31 dias.`;
}
