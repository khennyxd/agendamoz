/**
 * POST /api/activate-plan
 *
 * Called by the payment webhook (or manually by admin) to activate a plan.
 * Supports M-Pesa, eMola, and card payments.
 *
 * For M-Pesa/eMola: the payment processor sends a webhook here after confirming payment.
 * For manual admin: POST with { business_id, plan, payment_method, reference }
 *
 * Body:
 *   {
 *     business_id: string,
 *     plan: "basico" | "profissional" | "empresarial",
 *     payment_method: "mpesa" | "emola" | "card",
 *     reference: string,   // M-Pesa/eMola transaction ID or card charge ID
 *     amount_mzn: number,
 *     secret?: string      // webhook secret for automated calls
 *   }
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { addDays } from "date-fns";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_PRICES: Record<string, number> = {
  basico:       599,
  profissional: 1299,
  empresarial:  2499,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { business_id, plan, payment_method, reference, amount_mzn, secret } = body;

    // Allow webhook secret OR admin auth
    const isWebhook = secret === process.env.PAYMENT_WEBHOOK_SECRET;
    const authHeader = request.headers.get("authorization");
    const isAdmin = authHeader === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;

    if (!isWebhook && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!business_id || !plan || !reference) {
      return NextResponse.json({ error: "Campos obrigatórios em falta" }, { status: 400 });
    }

    const expectedAmount = PLAN_PRICES[plan];
    if (expectedAmount && amount_mzn && amount_mzn < expectedAmount) {
      return NextResponse.json(
        { error: `Valor insuficiente. Esperado: ${expectedAmount} MZN` },
        { status: 400 }
      );
    }

    // Record payment
    const { error: paymentError } = await supabaseAdmin.from("payments").upsert({
      business_id,
      plan,
      amount_mzn: amount_mzn || expectedAmount,
      mpesa_reference: reference,
      payment_method: payment_method || "mpesa",
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    }, { onConflict: "mpesa_reference" });

    if (paymentError) {
      console.error("Payment insert error:", paymentError);
    }

    // Activate business — subscription valid for 31 days
    const subscriptionEnds = addDays(new Date(), 31).toISOString();
    const { error: bizError } = await supabaseAdmin
      .from("businesses")
      .update({
        plan,
        is_active: true,
        subscription_ends_at: subscriptionEnds,
      })
      .eq("id", business_id);

    if (bizError) {
      return NextResponse.json({ error: bizError.message }, { status: 500 });
    }

    // Send confirmation SMS to business owner
    try {
      const { data: biz } = await supabaseAdmin
        .from("businesses")
        .select("name, phone")
        .eq("id", business_id)
        .single();

      if (biz?.phone) {
        const planNames: Record<string, string> = {
          basico: "Básico",
          profissional: "Profissional",
          empresarial: "Empresarial",
        };
        const msg = `✅ AgendaMoz: O seu plano ${planNames[plan] || plan} foi activado com sucesso! Ref: ${reference}. Válido por 31 dias.`;
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agendamoz.vercel.app";
        await fetch(`${baseUrl}/api/send-sms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: biz.phone, message: msg }),
        });
      }
    } catch (e) {
      console.error("Could not send activation SMS:", e);
    }

    return NextResponse.json({
      ok: true,
      activated: true,
      plan,
      business_id,
      subscription_ends_at: subscriptionEnds,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
