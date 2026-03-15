"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, AlertCircle, Copy, Check } from "lucide-react";
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
    features: ["Tudo no Profissional", "Funcionários ilimitados", "Múltiplas filiais", "API de integração", "Gestor de conta dedicado"],
  },
];

const MPESA_NUMBER = "859210665"; // ← substitui pelo teu número M-Pesa

export default function BillingPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState<"plans" | "payment" | "confirm">("plans");
  const [mpesaRef, setMpesaRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
      setBusiness(biz);
      if (biz) {
        const { data: pays } = await supabase.from("payments").select("*").eq("business_id", biz.id).order("created_at", { ascending: false });
        setPayments(pays || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  function copyNumber() {
    navigator.clipboard.writeText(MPESA_NUMBER.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function submitPayment() {
    if (!business || !selectedPlan || !mpesaRef.trim()) return;
    setSubmitting(true);
    const plan = PLANS.find((p) => p.id === selectedPlan)!;
    await supabase.from("payments").insert({
      business_id: business.id,
      plan: selectedPlan,
      amount_mzn: plan.price,
      mpesa_reference: mpesaRef.trim(),
      status: "pending",
    });
    setSubmitted(true);
    setSubmitting(false);
  }

  const trialDaysLeft = business?.trial_ends_at
    ? differenceInDays(parseISO(business.trial_ends_at), new Date())
    : 0;

  const isOnTrial = !business?.is_active && trialDaysLeft > 0;
  const isExpired = !business?.is_active && trialDaysLeft <= 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (submitted) return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="font-display text-2xl font-bold mb-3">Pagamento submetido!</h2>
      <p className="text-gray-600 mb-4">Recebemos o seu pedido de activação. A equipa AgendaMoz irá verificar o pagamento e activar a sua conta em até <strong>2 horas úteis</strong>.</p>
      <div className="bg-teal-50 rounded-2xl p-4 text-sm text-gray-700">
        <p>Referência submetida: <strong>{mpesaRef}</strong></p>
        <p className="mt-1">Plano: <strong>{PLANS.find(p => p.id === selectedPlan)?.name}</strong></p>
      </div>
      <button onClick={() => { setSubmitted(false); setStep("plans"); setMpesaRef(""); }} className="mt-6 text-sm text-teal-700 underline">
        Voltar aos planos
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Subscrição</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie o seu plano e pagamentos</p>
      </div>

      {/* Status banner */}
      {business?.is_active ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4 mb-8">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Conta activa — Plano {business.plan || "Profissional"}</p>
            {business.subscription_ends_at && (
              <p className="text-green-700 text-sm">Renova em {format(parseISO(business.subscription_ends_at), "d MMMM yyyy", { locale: pt })}</p>
            )}
          </div>
        </div>
      ) : isOnTrial ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4 mb-8">
          <Clock className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">Período de teste — {trialDaysLeft} dias restantes</p>
            <p className="text-amber-700 text-sm">Os seus clientes podem fazer reservas. Subscreva antes do fim do período.</p>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4 mb-8">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Conta inactiva</p>
            <p className="text-red-700 text-sm">Os seus clientes não conseguem fazer reservas. Subscreva um plano para reactivar.</p>
          </div>
        </div>
      )}

      {step === "plans" && (
        <>
          <h2 className="font-display text-xl font-bold mb-6">Escolha o seu plano</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`rounded-2xl p-6 cursor-pointer transition-all border-2 ${
                  selectedPlan === plan.id
                    ? "border-teal-700 bg-teal-50"
                    : plan.highlight
                    ? "border-teal-200 bg-white shadow-md"
                    : "border-gray-200 bg-white hover:border-teal-300"
                }`}
              >
                {plan.highlight && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
                    MAIS POPULAR
                  </span>
                )}
                <p className="font-display text-2xl font-bold mb-1">{plan.price} <span className="text-base font-normal text-gray-500">MZN/mês</span></p>
                <p className="font-semibold mb-1">{plan.name}</p>
                <p className="text-gray-500 text-xs mb-4">{plan.desc}</p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep("payment")}
            disabled={!selectedPlan}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar para pagamento →
          </button>
        </>
      )}

      {step === "payment" && (
        <div className="max-w-lg">
          <button onClick={() => setStep("plans")} className="text-sm text-teal-700 mb-6 hover:text-teal-800">← Voltar</button>
          <h2 className="font-display text-xl font-bold mb-2">Pagar via M-Pesa</h2>
          <p className="text-gray-500 text-sm mb-6">
            Plano seleccionado: <strong>{PLANS.find(p => p.id === selectedPlan)?.name}</strong> — <strong>{PLANS.find(p => p.id === selectedPlan)?.price} MZN/mês</strong>
          </p>

          {/* Payment instructions */}
          <div className="bg-teal-800 rounded-2xl p-6 text-white mb-6">
            <p className="font-display text-lg font-bold mb-4">Instruções de pagamento</p>
            <ol className="space-y-3 text-sm text-teal-100">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-teal-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                Abra o M-Pesa no seu telemóvel
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-teal-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                Seleccione <strong className="text-white">Enviar Dinheiro</strong>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-teal-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                Envie <strong className="text-white">{PLANS.find(p => p.id === selectedPlan)?.price} MZN</strong> para o número:
              </li>
            </ol>

            <div className="mt-4 bg-teal-900/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-teal-300 mb-1">Número M-Pesa AgendaMoz</p>
                <p className="text-2xl font-bold tracking-wider">{MPESA_NUMBER}</p>
              </div>
              <button onClick={copyNumber} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            <li className="flex gap-3 text-sm text-teal-100 mt-3 list-none">
              <span className="w-6 h-6 bg-teal-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
              Após o pagamento, copie a <strong className="text-white">referência/código</strong> que o M-Pesa envia por SMS
            </li>
          </div>

          {/* Reference input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Referência M-Pesa (código do SMS de confirmação)
            </label>
            <input
              className="input"
              placeholder="Ex: BC12345678"
              value={mpesaRef}
              onChange={(e) => setMpesaRef(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">O código aparece no SMS que o M-Pesa envia após o pagamento</p>
          </div>

          <button
            onClick={submitPayment}
            disabled={!mpesaRef.trim() || submitting}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "A submeter..." : "Confirmar pagamento"}
          </button>
        </div>
      )}

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold mb-4">Histórico de pagamentos</h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Data</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Plano</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Valor</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Referência</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 text-sm">{format(parseISO(p.created_at), "d MMM yyyy", { locale: pt })}</td>
                    <td className="px-4 py-4 text-sm capitalize">{p.plan}</td>
                    <td className="px-4 py-4 text-sm font-semibold">{p.amount_mzn} MZN</td>
                    <td className="px-4 py-4 text-sm font-mono">{p.mpesa_reference}</td>
                    <td className="px-4 py-4">
                      {p.status === "pending" && <span className="badge-pending">Pendente</span>}
                      {p.status === "confirmed" && <span className="badge-confirmed">Confirmado</span>}
                      {p.status === "rejected" && <span className="badge-cancelled">Rejeitado</span>}
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
