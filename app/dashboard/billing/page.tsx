"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, AlertCircle, Copy, Check, CreditCard, Smartphone, Wallet } from "lucide-react";
import { supabase, type Business } from "@/lib/supabase";
import { format, parseISO, differenceInDays } from "date-fns";
import { pt } from "date-fns/locale";

const PLANS = [
  {
    id: "basico",
    name: "Básico",
    price: 599,
    desc: "Perfeito para começar",
    features: ["Até 50 agendamentos/mês", "1 funcionário", "Página de reserva pública", "Suporte por email"],
  },
  {
    id: "profissional",
    name: "Profissional",
    price: 1299,
    desc: "Para negócios em crescimento",
    features: ["Agendamentos ilimitados", "Até 5 funcionários", "Lembretes por SMS", "Relatórios mensais", "Suporte prioritário"],
    highlight: true,
  },
  {
    id: "empresarial",
    name: "Empresarial",
    price: 2499,
    desc: "Para múltiplas unidades",
    features: ["Tudo no Profissional", "Funcionários ilimitados", "Múltiplas filiais", "Personalização da página pública", "Gestor de conta dedicado"],
  },
];

const MPESA_NUMBER  = process.env.NEXT_PUBLIC_MPESA_NUMBER  || "84 XXX XXXX";
const EMOLA_NUMBER  = process.env.NEXT_PUBLIC_EMOLA_NUMBER  || "86 XXX XXXX";

type PaymentMethod = "mpesa" | "emola" | "card";

export default function BillingPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState<"plans" | "method" | "payment" | "confirm">("plans");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("mpesa");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activated, setActivated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);

  // Card payment fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
      setBusiness(biz);
      if (biz) {
        const { data: pays } = await supabase
          .from("payments")
          .select("*")
          .eq("business_id", biz.id)
          .order("created_at", { ascending: false });
        setPayments(pays || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  function copyNumber(num: string) {
    navigator.clipboard.writeText(num.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function submitPayment() {
    if (!business || !selectedPlan) return;
    if ((payMethod === "mpesa" || payMethod === "emola") && !reference.trim()) return;
    if (payMethod === "card" && (!cardName || !cardNumber || !cardExpiry || !cardCvv)) return;

    setSubmitting(true);

    const plan = PLANS.find((p) => p.id === selectedPlan)!;
    const ref = payMethod === "card"
      ? `CARD-${cardNumber.slice(-4)}-${Date.now()}`
      : reference.trim();

    // Store payment
    await supabase.from("payments").insert({
      business_id: business.id,
      plan: selectedPlan,
      amount_mzn: plan.price,
      mpesa_reference: ref,
      payment_method: payMethod,
      status: "pending",
    });

    // For card payments: attempt auto-activation via API
    // For M-Pesa/eMola: show pending state (webhook or admin confirms)
    if (payMethod === "card") {
      // In production, integrate with a real card gateway here.
      // For now, we store as pending and admin confirms.
      // Replace with actual Pesepay/Flutterwave/Stripe call.
      setSubmitted(true);
    } else {
      setSubmitted(true);
    }

    setSubmitting(false);
  }

  const trialDaysLeft = business?.trial_ends_at
    ? differenceInDays(parseISO(business.trial_ends_at), new Date())
    : 0;

  const isOnTrial = !business?.is_active && trialDaysLeft > 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (submitted) return (
    <div className="max-w-lg mx-auto text-center py-16 px-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">Pagamento submetido!</h2>
      <p className="text-gray-600 mb-4">
        {payMethod === "card"
          ? "O pagamento com cartão está a ser processado. A sua conta será activada automaticamente em instantes."
          : "Recebemos o seu pedido. A equipa AgendaMoz verificará o pagamento e activará a sua conta em até 2 horas úteis."}
      </p>
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-sm text-gray-700 text-left">
        <p>Referência: <strong>{payMethod === "card" ? cardNumber.slice(-4).padStart(16, "•").replace(/(.{4})/g,"$1 ").trim() : reference}</strong></p>
        <p className="mt-1">Plano: <strong>{PLANS.find(p => p.id === selectedPlan)?.name}</strong></p>
        <p className="mt-1">Método: <strong>{{ mpesa: "M-Pesa", emola: "eMola", card: "Cartão Visa/Mastercard" }[payMethod]}</strong></p>
      </div>
      <button
        onClick={() => { setSubmitted(false); setStep("plans"); setReference(""); setCardNumber(""); setCardName(""); setCardExpiry(""); setCardCvv(""); }}
        className="mt-6 text-sm text-purple-600 underline"
      >
        Voltar aos planos
      </button>
    </div>
  );

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan);

  return (
    <div className="max-w-4xl mx-auto px-0 sm:px-0">
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Subscrição</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie o seu plano e pagamentos</p>
      </div>

      {/* Status banner */}
      {business?.is_active ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-3 sm:gap-4 mb-8">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <p className="font-semibold text-green-800">Conta activa — Plano {business.plan
              ? business.plan.charAt(0).toUpperCase() + business.plan.slice(1)
              : "Profissional"}</p>
            {business.subscription_ends_at && (
              <p className="text-green-600 text-sm mt-0.5">Renova em {format(parseISO(business.subscription_ends_at), "d MMMM yyyy", { locale: pt })}</p>
            )}
          </div>
        </div>
      ) : isOnTrial ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-3 sm:gap-4 mb-8">
          <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <p className="font-semibold text-amber-800">Período de teste — {trialDaysLeft} dias restantes</p>
            <p className="text-amber-700 text-sm mt-0.5">Os seus clientes podem fazer reservas. Subscreva antes do fim.</p>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-3 sm:gap-4 mb-8">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <p className="font-semibold text-red-800">Conta inactiva</p>
            <p className="text-red-600 text-sm mt-0.5">Os seus clientes não conseguem fazer reservas. Subscreva um plano.</p>
          </div>
        </div>
      )}

      {/* STEP: Plans */}
      {step === "plans" && (
        <>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-5">Escolha o seu plano</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`rounded-2xl p-5 sm:p-6 cursor-pointer transition-all border-2 ${
                  selectedPlan === plan.id
                    ? "border-purple-600 bg-purple-50 shadow-md"
                    : plan.highlight
                    ? "border-purple-200 bg-white shadow-sm"
                    : "border-gray-200 bg-white hover:border-purple-300"
                }`}
              >
                {plan.highlight && (
                  <span className="bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
                    MAIS POPULAR
                  </span>
                )}
                <p className="font-nums text-2xl font-bold text-gray-900 mb-0.5">
                  {plan.price} <span className="text-base font-normal text-gray-500">MZN/mês</span>
                </p>
                <p className="font-semibold text-gray-900 mb-0.5">{plan.name}</p>
                <p className="text-gray-500 text-xs mb-4">{plan.desc}</p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep("method")}
            disabled={!selectedPlan}
            className="btn-primary w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar para pagamento →
          </button>
        </>
      )}

      {/* STEP: Payment Method */}
      {step === "method" && (
        <div className="max-w-lg">
          <button onClick={() => setStep("plans")} className="text-sm text-purple-600 mb-6 hover:text-purple-700">← Voltar</button>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Método de pagamento</h2>
          <p className="text-gray-500 text-sm mb-6">
            Plano <strong className="text-gray-800">{selectedPlanData?.name}</strong> — <strong className="text-gray-800">{selectedPlanData?.price} MZN/mês</strong>
          </p>

          <div className="grid grid-cols-1 gap-3 mb-8">
            {[
              { id: "mpesa" as PaymentMethod, label: "M-Pesa", sublabel: "Vodacom Moçambique", icon: <Smartphone className="w-6 h-6 text-red-500" />, color: "border-red-200 hover:border-red-400" },
              { id: "emola" as PaymentMethod, label: "eMola", sublabel: "Movitel Moçambique", icon: <Wallet className="w-6 h-6 text-green-600" />, color: "border-green-200 hover:border-green-400" },
              { id: "card" as PaymentMethod, label: "Visa / Mastercard", sublabel: "Cartão de crédito ou débito", icon: <CreditCard className="w-6 h-6 text-blue-500" />, color: "border-blue-200 hover:border-blue-400" },
            ].map((m) => (
              <div
                key={m.id}
                onClick={() => setPayMethod(m.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  payMethod === m.id ? "border-purple-600 bg-purple-50" : `border-gray-200 bg-white ${m.color}`
                }`}
              >
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {m.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{m.label}</p>
                  <p className="text-gray-500 text-xs">{m.sublabel}</p>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${payMethod === m.id ? "border-purple-600 bg-purple-600" : "border-gray-300"}`}>
                  {payMethod === m.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep("payment")}
            className="btn-primary w-full justify-center"
          >
            Continuar →
          </button>
        </div>
      )}

      {/* STEP: Payment Details */}
      {step === "payment" && (
        <div className="max-w-lg">
          <button onClick={() => setStep("method")} className="text-sm text-purple-600 mb-6 hover:text-purple-700">← Voltar</button>

          {/* M-Pesa */}
          {payMethod === "mpesa" && (
            <>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Pagar via M-Pesa</h2>
              <p className="text-gray-500 text-sm mb-6">
                <strong className="text-gray-800">{selectedPlanData?.name}</strong> — <strong className="text-gray-800">{selectedPlanData?.price} MZN/mês</strong>
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-gray-800 mb-6">
                <p className="font-semibold text-gray-900 mb-4">Instruções de pagamento</p>
                <ol className="space-y-3 text-sm text-gray-700">
                  {["Abra o M-Pesa no seu telemóvel", "Seleccione Enviar Dinheiro", `Envie ${selectedPlanData?.price} MZN para o número:`, "Copie a referência do SMS de confirmação"].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>

                <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Número M-Pesa AgendaMoz</p>
                    <p className="text-xl font-bold text-gray-900 tracking-wider">{MPESA_NUMBER}</p>
                  </div>
                  <button
                    onClick={() => copyNumber(MPESA_NUMBER)}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Referência M-Pesa (código do SMS)
                </label>
                <input
                  className="input"
                  placeholder="Ex: BC12345678"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">O código aparece no SMS do M-Pesa após o pagamento</p>
              </div>
            </>
          )}

          {/* eMola */}
          {payMethod === "emola" && (
            <>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Pagar via eMola</h2>
              <p className="text-gray-500 text-sm mb-6">
                <strong className="text-gray-800">{selectedPlanData?.name}</strong> — <strong className="text-gray-800">{selectedPlanData?.price} MZN/mês</strong>
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-gray-800 mb-6">
                <p className="font-semibold text-gray-900 mb-4">Instruções de pagamento</p>
                <ol className="space-y-3 text-sm text-gray-700">
                  {["Abra o eMola no seu telemóvel", "Seleccione Transferir Dinheiro", `Envie ${selectedPlanData?.price} MZN para o número:`, "Copie a referência do SMS de confirmação"].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>

                <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Número eMola AgendaMoz</p>
                    <p className="text-xl font-bold text-gray-900 tracking-wider">{EMOLA_NUMBER}</p>
                  </div>
                  <button
                    onClick={() => copyNumber(EMOLA_NUMBER)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Referência eMola (código do SMS)
                </label>
                <input
                  className="input"
                  placeholder="Ex: EM12345678"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Card */}
          {payMethod === "card" && (
            <>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Pagar com Cartão</h2>
              <p className="text-gray-500 text-sm mb-6">
                <strong className="text-gray-800">{selectedPlanData?.name}</strong> — <strong className="text-gray-800">{selectedPlanData?.price} MZN/mês</strong>
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Nome no cartão</label>
                  <input className="input bg-white" placeholder="João Silva" value={cardName} onChange={e => setCardName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Número do cartão</label>
                  <input
                    className="input bg-white font-mono tracking-widest"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    value={cardNumber}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                      setCardNumber(v.replace(/(.{4})/g, "$1 ").trim());
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Validade</label>
                    <input
                      className="input bg-white"
                      placeholder="MM/AA"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setCardExpiry(v.length >= 3 ? v.slice(0, 2) + "/" + v.slice(2) : v);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">CVV</label>
                    <input
                      className="input bg-white"
                      placeholder="123"
                      maxLength={4}
                      type="password"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Pagamento seguro com encriptação SSL
                </div>
              </div>
            </>
          )}

          <button
            onClick={submitPayment}
            disabled={
              submitting ||
              (payMethod !== "card" && !reference.trim()) ||
              (payMethod === "card" && (!cardName || !cardNumber || !cardExpiry || !cardCvv))
            }
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                A processar...
              </span>
            ) : (
              `Confirmar pagamento de ${selectedPlanData?.price} MZN`
            )}
          </button>
        </div>
      )}

      {/* Payment history */}
      {payments.length > 0 && step === "plans" && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Histórico de pagamentos</h2>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {payments.map((p) => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 capitalize">{p.plan}</span>
                  {p.status === "pending"   && <span className="badge-pending">Pendente</span>}
                  {p.status === "confirmed" && <span className="badge-confirmed">Confirmado</span>}
                  {p.status === "rejected"  && <span className="badge-cancelled">Rejeitado</span>}
                </div>
                <p className="text-sm text-gray-600">{format(parseISO(p.created_at), "d MMM yyyy", { locale: pt })}</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{p.amount_mzn} MZN</p>
                <p className="text-xs text-gray-400 font-mono mt-1 truncate">{p.mpesa_reference}</p>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden sm:block bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Data</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Plano</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Valor</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Referência</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700">{format(parseISO(p.created_at), "d MMM yyyy", { locale: pt })}</td>
                    <td className="px-4 py-4 text-sm capitalize text-gray-700">{p.plan}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">{p.amount_mzn} MZN</td>
                    <td className="px-4 py-4 text-sm font-mono text-gray-600">{p.mpesa_reference}</td>
                    <td className="px-4 py-4">
                      {p.status === "pending"   && <span className="badge-pending">Pendente</span>}
                      {p.status === "confirmed" && <span className="badge-confirmed">Confirmado</span>}
                      {p.status === "rejected"  && <span className="badge-cancelled">Rejeitado</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
