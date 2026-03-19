import { NextResponse } from "next/server";

const AT_USERNAME = process.env.AFRICASTALKING_USERNAME!;
const AT_API_KEY  = process.env.AFRICASTALKING_API_KEY!;
const SANDBOX     = AT_USERNAME === "sandbox";

const AT_SMS_URL = SANDBOX
  ? "https://api.sandbox.africastalking.com/version1/messaging"
  : "https://api.africastalking.com/version1/messaging";

export async function POST(request: Request) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json({ error: "Destinatário e mensagem são obrigatórios" }, { status: 400 });
    }

    // Normalize phone number to international format for Mozambique
    let phone = to.replace(/\s/g, "");
    if (phone.startsWith("8") && phone.length === 9) phone = "+258" + phone;
    if (phone.startsWith("258") && !phone.startsWith("+")) phone = "+" + phone;

    const body = new URLSearchParams({
      username: AT_USERNAME,
      to:       phone,
      message,
    });

    const res = await fetch(AT_SMS_URL, {
      method: "POST",
      headers: {
        "apiKey":       AT_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept":       "application/json",
      },
      body: body.toString(),
    });

    const data = await res.json();
    const recipient = data?.SMSMessageData?.Recipients?.[0];

    if (recipient?.status === "Success" || recipient?.statusCode === 101) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: recipient?.status || "Erro ao enviar SMS" }, { status: 500 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
