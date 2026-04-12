"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Clock, Calendar, Users, DollarSign, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

const ADMIN_EMAIL = "khensaniorlando@gmail.com";

type Payment = {
  id: string;
  business_id: string;
  plan: string;
  amount_mzn: number;
  mpesa_reference: string;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
  business?: { name: string; slug: string; phone: string; owner_id: string };
};

type Business = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  is_active: boolean;
  plan: string | null;
  created_at: string;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [tab, setTab] = useState<"payments" | "businesses">("payments");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) { router.push("/dashboard"); return; }
      setAuthorized(true);
      await fetchData();
      setLoading(false);
    }
    load();
  }, [router]);

  async function fetchData() {
    const [{ data: pays }, { data: bizs }] = await Promise.all([
      supabase.from("payments").select("*, business:businesses(name, slug, phone, owner_id)").order("created_at", { ascending: false }),
      supabase.from("businesses").select("*").order("created_at", { ascending: false }),
    ]);
    setPayments(pays || []);
    setBusinesses(bizs || []);
  }

  async function confirmPayment(payment: Payment) {
    setProcessing(payment.id);
    await supabase.from("payments").update({ status: "confirmed", confirmed_at: new Date().toISOString() }).eq("id", payment.id);
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    await supabase.from("businesses").update({
      is_active: true, plan: payment.plan, subscription_ends_at: subscriptionEnd.toISOString(),
    }).eq("id", payment.business_id);
    await fetchData();
    setProcessing(null);
  }

  async function rejectPayment(paymentId: string) {
    setProcessing(paymentId);
    await supabase.from("payments").update({ status: "rejected" }).eq("id", paymentId);
    await fetchData();
    setProcessing(null);
  }

  async function toggleBusiness(biz: Business) {
    setProcessing(biz.id);
    await supabase.from("businesses").update({ is_active: !biz.is_active }).eq("id", biz.id);
    await fetchData();
    setProcessing(null);
  }

  const pendingPayments = payments.filter(p => p.status === "pending");
  const activeBusinesses = businesses.filter(b => b.is_active).length;
  const totalRevenue = payments.filter(p => p.status === "confirmed").reduce((sum, p) => sum + p.amount_mzn, 0);

  if (loading) return (
    <div className="min-h-screen bg-purple-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 to-purple-800 text-white px-6 py-5 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img src="/amlogo.svg" alt="AgendaMoz" className="h-8 w-auto brightness-0 invert" />
              <span className="font-display text-xl hidden sm:block">
                <span className="font-bold">Agenda</span><span className="font-normal">Moz</span>
              </span>
            </Link>
            <div className="w-px h-8 bg-purple-600 hidden sm:block" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-300" />
              <div>
                <h1 className="font-display text-lg font-bold leading-none">Painel Admin</h1>
                <p className="text-purple-300 text-xs mt-0.5">Gestão de clientes e pagamentos</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-purple-300 hover:text-white transition-colors flex-shrink-0"
          >
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pagamentos pendentes", value: pendingPayments.length, icon: Clock, bg: "bg-amber-50", iconColor: "text-amber-600" },
            { label: "Negócios activos", value: activeBusinesses, icon: CheckCircle, bg: "bg-purple-50", iconColor: "text-purple-600" },
            { label: "Total de negócios", value: businesses.length, icon: Users, bg: "bg-purple-50", iconColor: "text-purple-600" },
            { label: "Receita total", value: `${totalRevenue.toLocaleString("pt-MZ")} MZN`, icon: DollarSign, bg: "bg-purple-50", iconColor: "text-purple-600" },
          ].map(({ label, value, icon: Icon, bg, iconColor }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <p className="font-display text-2xl font-bold text-gray-900 font-nums">{value}</p>
              <p className="text-gray-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("payments")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === "payments"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-700 border border-gray-200"
            }`}
          >
            Pagamentos{" "}
            {pendingPayments.length > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-nums">
                {pendingPayments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("businesses")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === "businesses"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-700 border border-gray-200"
            }`}
          >
            Negócios
          </button>
        </div>

        {/* Payments tab */}
        {tab === "payments" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {payments.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <DollarSign className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>Nenhum pagamento ainda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-purple-50 border-b border-purple-100">
                      <th className="text-left text-xs font-semibold text-purple-700 uppercase tracking-wide px-6 py-4">Negócio</th>
                      <th className="text-left text-xs font-semibold text-purple-700 uppercase tracking-wide px-4 py-4">Plano</th>
                      <th className="text-left text-xs font-semibold text-purple-700 uppercase tracking-wide px-4 py-4">Valor</th>
                      <th className="text-left text-xs font-semibold text-purple-700 uppercase tracking-wide px-4 py-4">Referência M-Pesa</th>
                      <th className="text-left text-xs font-semibold text-purple-700 uppercase tracking-wide px-4 py-4">Data</th>
                      <th className="text-left text-xs font-semibold text-purple-700 uppercase tracking-wide px-4 py-4">Estado</th>
                      <th className="text-left text-xs font-semibold text-purple-700 uppercase tracking-wide px-4 py-4">Acções</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map((p) => (
                      <tr key={p.id} className={p.status === "pending" ? "bg-amber-50/40" : ""}>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-sm text-gray-900">{p.business?.name || "—"}</p>
                          <p className="text-gray-500 text-xs font-nums">{p.business?.phone}</p>
                        </td>
                        <td className="px-4 py-4 text-sm capitalize text-gray-700">{p.plan}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900 font-nums">{p.amount_mzn.toLocaleString("pt-MZ")} MZN</td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm bg-purple-50 text-purple-800 px-2 py-1 rounded-lg border border-purple-100">
                            {p.mpesa_reference}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 font-nums">
                          {format(parseISO(p.created_at), "d MMM yyyy HH:mm", { locale: pt })}
                        </td>
                        <td className="px-4 py-4">
                          {p.status === "pending"   && <span className="badge-pending">Pendente</span>}
                          {p.status === "confirmed" && <span className="badge-confirmed">Confirmado</span>}
                          {p.status === "rejected"  && <span className="badge-cancelled">Rejeitado</span>}
                        </td>
                        <td className="px-4 py-4">
                          {p.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => confirmPayment(p)}
                                disabled={processing === p.id}
                                className="flex items-center gap-1 bg-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                {processing === p.id ? "..." : "Confirmar"}
                              </button>
                              <button
                                onClick={() => rejectPayment(p.id)}
                                disabled={processing === p.id}
                                className="flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Rejeitar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Businesses tab */}
        {tab === "businesses" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-purple-50 border-b border-purple-100">
                    <th className="text-left text-xs font-semibold text-purple-700 uppercase tracking-wide px-6 py-4">Negócio</th>
                    <th className="text-left text-xs font-semibold text-purple-700 uppercase tracking-wide px-4 py-4">Plano</th>
                    <th className="text-left text-xs font-semibold text-purple-700 uppercase tracking-wide px-4 py-4">Registado</th>
                    <th className="text-left text-xs font-semibold text-purple-700 uppercase tracking-wide px-4 py-4">Estado</th>
                    <th className="text-left text-xs font-semibold text-purple-700 uppercase tracking-wide px-4 py-4">Acção</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {businesses.map((biz) => (
                    <tr key={biz.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-sm text-gray-900">{biz.name}</p>
                        <a href={`/book/${biz.slug}`} target="_blank" className="text-purple-600 text-xs hover:underline">
                          /book/{biz.slug}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-sm capitalize text-gray-700">{biz.plan || "—"}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 font-nums">
                        {format(parseISO(biz.created_at), "d MMM yyyy", { locale: pt })}
                      </td>
                      <td className="px-4 py-4">
                        {biz.is_active
                          ? <span className="badge-confirmed">Activo</span>
                          : <span className="badge-cancelled">Inactivo</span>
                        }
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleBusiness(biz)}
                          disabled={processing === biz.id}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                            biz.is_active
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                          }`}
                        >
                          {processing === biz.id ? "..." : biz.is_active ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
