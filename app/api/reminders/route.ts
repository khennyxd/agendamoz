/**
 * POST /api/reminders
 *
 * Cron job: trigger at 13:00 UTC (15:00 Mozambique time = UTC+2) every day.
 * It sends TWO kinds of reminders:
 *
 *   1. "15h reminder" — sends to appointments scheduled for TOMORROW
 *      (so client gets it at 15h the day before)
 *
 *   2. "2h reminder" — sends to appointments whose time is approximately
 *      NOW + 2 hours on the same day (runs every 15-30min via cron).
 *
 * Vercel cron config (vercel.json):
 *   { "path": "/api/reminders", "schedule": "0,30 * * * *" }
 *   (runs every 30 min so the 2h window is caught precisely)
 *
 * Secured with CRON_SECRET env var.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { smsLembrete } from "@/lib/sms";
import { format, addHours, addDays, parseISO } from "date-fns";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  // Secure the endpoint
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Mozambique is UTC+2
  const mozNow = addHours(now, 2);
  const mozHour = mozNow.getHours();
  const mozMin  = mozNow.getMinutes();
  const today   = format(mozNow, "yyyy-MM-dd");
  const tomorrow = format(addDays(mozNow, 1), "yyyy-MM-dd");

  const results: string[] = [];

  // ── 1. Tomorrow reminders (send at 15:00 Moz) ──────────────────────────
  if (mozHour === 15 && mozMin < 30) {
    const { data: tomorrowAppts } = await supabaseAdmin
      .from("appointments")
      .select("*, service:services(name), business:businesses(name, plan, is_active, phone)")
      .eq("date", tomorrow)
      .in("status", ["pending", "confirmed"]);

    for (const appt of tomorrowAppts || []) {
      const biz = (appt as any).business;
      // Only send for active profissional/empresarial businesses
      if (!biz?.is_active || !["profissional", "empresarial"].includes(biz?.plan)) continue;

      const dateFormatted = format(parseISO(appt.date), "dd/MM/yyyy");
      const svcName = (appt as any).service?.name || "a sua reserva";
      const msg = smsLembrete(
        appt.client_name,
        biz.name,
        dateFormatted,
        appt.time.slice(0, 5),
        svcName
      );

      await sendSMSInternal(appt.client_phone, msg);
      results.push(`tomorrow-${appt.id}`);
    }
  }

  // ── 2. 2-hour reminders (check every 30min run) ────────────────────────
  // Target window: appointments whose time is between (now+1h50) and (now+2h10) today
  const windowStart = addHours(mozNow, 1);
  const windowEnd   = addHours(mozNow, 2);
  const windowStartTime = format(windowStart, "HH:mm");
  const windowEndTime   = format(windowEnd,   "HH:mm");

  const { data: soonAppts } = await supabaseAdmin
    .from("appointments")
    .select("*, service:services(name), business:businesses(name, plan, is_active)")
    .eq("date", today)
    .in("status", ["pending", "confirmed"])
    .gte("time", windowStartTime + ":00")
    .lte("time", windowEndTime + ":59");

  for (const appt of soonAppts || []) {
    const biz = (appt as any).business;
    if (!biz?.is_active || !["profissional", "empresarial"].includes(biz?.plan)) continue;

    const svcName = (appt as any).service?.name || "a sua reserva";
    const msg = `⏰ Lembrete: ${appt.client_name}, tem uma reserva em ${biz.name} em 2 horas.\n📅 Hoje às ${appt.time.slice(0, 5)} — ${svcName}`;

    await sendSMSInternal(appt.client_phone, msg);
    results.push(`2h-${appt.id}`);
  }

  return NextResponse.json({
    ok: true,
    sent: results.length,
    details: results,
    mozTime: `${mozHour}:${String(mozMin).padStart(2, "0")}`,
  });
}

async function sendSMSInternal(to: string, message: string): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agendamoz.vercel.app";
    await fetch(`${baseUrl}/api/send-sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-key": process.env.CRON_SECRET || "",
      },
      body: JSON.stringify({ to, message }),
    });
  } catch (e) {
    console.error("sendSMSInternal error:", e);
  }
}
