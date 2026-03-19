// SMS helper — called server-side or via API route

export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    const res = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, message }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// SMS templates
export function smsConfirmacao(clientName: string, businessName: string, date: string, time: string, serviceName: string): string {
  return `Olá ${clientName}! A sua reserva em ${businessName} foi confirmada.\n📅 ${date} às ${time}\n💼 ${serviceName}\nObrigado!`;
}

export function smsPendente(clientName: string, businessName: string, date: string, time: string): string {
  return `Olá ${clientName}! Recebemos a sua reserva em ${businessName} para ${date} às ${time}. Aguarde confirmação.`;
}

export function smsCancelamento(clientName: string, businessName: string, date: string, time: string): string {
  return `Olá ${clientName}, informamos que a sua reserva em ${businessName} para ${date} às ${time} foi cancelada.`;
}

export function smsLembrete(clientName: string, businessName: string, date: string, time: string, serviceName: string): string {
  return `Lembrete: ${clientName}, tem uma reserva amanhã em ${businessName}.\n📅 ${date} às ${time}\n💼 ${serviceName}`;
}
